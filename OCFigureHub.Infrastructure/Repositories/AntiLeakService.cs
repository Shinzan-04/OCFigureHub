using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;
using System.Security.Cryptography;
using System.Text;

namespace OCFigureHub.Infrastructure.Repositories;

public class AntiLeakService : IAntiLeakService
{
    private readonly AppDbContext _db;

    // Max downloads per user per hour
    private const int MaxDownloadsPerHour = 20;

    public AntiLeakService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CheckRateLimitAsync(Guid userId, CancellationToken ct)
    {
        var oneHourAgo = DateTime.UtcNow.AddHours(-1);

        var recentCount = await _db.DownloadHistories
            .CountAsync(d =>
                d.UserId == userId &&
                d.Success &&
                d.DownloadedAt >= oneHourAgo,
            ct);

        if (recentCount >= MaxDownloadsPerHour)
        {
            throw new InvalidOperationException(
                $"Rate limit exceeded: max {MaxDownloadsPerHour} downloads per hour");
        }
    }

    public async Task<string> RecordWatermarkAsync(
        Guid userId,
        Guid productId,
        Guid? downloadTokenId,
        CancellationToken ct)
    {
        var hash = GenerateWatermarkHash(userId, productId);

        var watermark = new WatermarkInfo
        {
            UserId = userId,
            ProductId = productId,
            DownloadTokenId = downloadTokenId,
            WatermarkHash = hash,
            EmbeddedAt = DateTime.UtcNow
        };

        _db.WatermarkInfos.Add(watermark);
        await _db.SaveChangesAsync(ct);

        return hash;
    }

    private static string GenerateWatermarkHash(Guid userId, Guid productId)
    {
        var raw = $"{userId}:{productId}:{DateTime.UtcNow.Ticks}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(bytes);
    }
}
