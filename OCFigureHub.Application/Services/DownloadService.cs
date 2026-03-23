using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Downloads;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using System.Security.Cryptography;
using System.Text;

namespace OCFigureHub.Application.Services;

public class DownloadService
{
    private readonly IDownloadRepository _repo;
    private readonly IStorageService _storage;
    private readonly IAntiLeakService _antiLeak;

    public DownloadService(IDownloadRepository repo, IStorageService storage, IAntiLeakService antiLeak)
    {
        _repo = repo;
        _storage = storage;
        _antiLeak = antiLeak;
    }

    public async Task<DownloadResponseDto> RequestSignedUrlAsync(
        Guid userId,
        DownloadRequestDto req,
        string? ip,
        string? userAgent,
        CancellationToken ct)
    {
        // Phase 3: Anti-leak rate limit check
        await _antiLeak.CheckRateLimitAsync(userId, ct);

        var user = await _repo.GetUserAsync(userId, ct)
                   ?? throw new Exception("User not found");

        if (user.Status == UserStatus.Locked)
        {
            await LogFail(userId, req.ProductId, "User locked", ip, userAgent, ct);
            throw new UnauthorizedAccessException("User locked");
        }

        var productOk = await _repo.IsProductEnabledAsync(req.ProductId, ct);
        if (!productOk)
        {
            await LogFail(userId, req.ProductId, "Product not found/disabled", ip, userAgent, ct);
            throw new Exception("Product not found");
        }

        Guid? orderId = null;
        Guid? subscriptionId = null;

        // 1) Check purchase
        var hasPaidOrder = await _repo.HasPaidOrderForProductAsync(userId, req.ProductId, ct);

        if (hasPaidOrder)
        {
            orderId = await _repo.GetAnyPaidOrderIdAsync(userId, ct);
        }
        else
        {
            // 2) Subscription entitlement + quota
            var sub = await _repo.GetActiveSubscriptionWithPlanAsync(userId, ct);
            if (sub == null)
            {
                await LogFail(userId, req.ProductId, "No entitlement (not purchased, no subscription)", ip, userAgent, ct);
                throw new UnauthorizedAccessException("No entitlement");
            }

            subscriptionId = sub.Id;

            var ym = DateTime.UtcNow.ToString("yyyy-MM");
            var quota = await _repo.GetQuotaUsageAsync(userId, ym, ct);

            if (quota == null)
            {
                quota = new QuotaUsage
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    YearMonth = ym,
                    UsedDownloads = 0,
                    LimitDownloads = sub.Plan.MonthlyQuotaDownloads,
                    CreatedAt = DateTime.UtcNow
                };

                await _repo.CreateQuotaUsageAsync(quota, ct);
                await _repo.SaveChangesAsync(ct);
            }

            if (quota.UsedDownloads >= quota.LimitDownloads)
            {
                await LogFail(userId, req.ProductId, "Quota exceeded", ip, userAgent, ct);
                throw new InvalidOperationException("Quota exceeded");
            }

            await _repo.IncreaseQuotaUsageAsync(quota, 1, ct);
            await _repo.SaveChangesAsync(ct);
        }

        // 3) Get model file by format
        var file = await _repo.GetModelFileAsync(req.ProductId, req.Format, ct);
        if (file == null)
        {
            await LogFail(userId, req.ProductId, "Model file not found for format", ip, userAgent, ct);
            throw new Exception("Model file not found");
        }

        // 4) Generate SAS URL (TTL 3 minutes + IP Restricted)
        var expiresAt = DateTime.UtcNow.AddMinutes(3);
        var signedUrl = _storage.GenerateReadSasUrl(file.StorageKey, TimeSpan.FromMinutes(3), ip);

        // 5) Save token (hash only)
        var token = new DownloadToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = req.ProductId,
            ExpiresAt = expiresAt,
            Used = false,
            SignedUrlHash = Sha256(signedUrl),
            CreatedAt = DateTime.UtcNow
        };
        await _repo.AddDownloadTokenAsync(token, ct);

        // 6) Log success
        await _repo.AddDownloadHistoryAsync(new DownloadHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = req.ProductId,
            OrderId = orderId,
            SubscriptionId = subscriptionId,
            IpAddress = ip,
            UserAgent = userAgent,
            Success = true,
            DownloadedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        }, ct);

        await _repo.SaveChangesAsync(ct);

        // 7) Phase 3: Record watermark metadata for anti-leak tracing
        await _antiLeak.RecordWatermarkAsync(userId, req.ProductId, token.Id, ct);

        return new DownloadResponseDto
        {
            SignedUrl = signedUrl,
            ExpiresAtUtc = expiresAt
        };
    }

    private async Task LogFail(Guid userId, Guid productId, string reason, string? ip, string? ua, CancellationToken ct)
    {
        await _repo.AddDownloadHistoryAsync(new DownloadHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = productId,
            IpAddress = ip,
            UserAgent = ua,
            Success = false,
            FailureReason = reason,
            DownloadedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        }, ct);

        await _repo.SaveChangesAsync(ct);
    }

    private static string Sha256(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes);
    }

    public async Task<List<DTOs.Downloads.DownloadHistoryDto>> GetHistoryAsync(Guid userId, CancellationToken ct)
    {
        var list = await _repo.GetHistoryByUserAsync(userId, ct);
        
        var productIds = list.Select(x => x.ProductId).Distinct().ToList();
        var products = await _repo.GetProductsByIdsAsync(productIds, ct);
        var productDict = products.ToDictionary(x => x.Id, x => x);

        return list.Select(h => 
        {
            productDict.TryGetValue(h.ProductId, out var product);
            var thumbUrl = product?.ThumbnailUrl;
            if (!string.IsNullOrEmpty(thumbUrl))
            {
                thumbUrl = _storage.GenerateReadSasUrl(thumbUrl, TimeSpan.FromHours(24));
            }

            return new DTOs.Downloads.DownloadHistoryDto
            {
                Id = h.Id,
                ProductId = h.ProductId,
                ProductName = product?.Name ?? "Unknown Product",
                ThumbnailUrl = thumbUrl,
                OrderId = h.OrderId,
                SubscriptionId = h.SubscriptionId,
                Success = h.Success,
                FailureReason = h.FailureReason,
                DownloadedAt = h.DownloadedAt
            };
        }).ToList();
    }
}
