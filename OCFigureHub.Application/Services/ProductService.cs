using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.Services;

public class ProductService
{
    private readonly IProductRepository _products;
    private readonly IStorageService _storage;
    private readonly IDownloadRepository _downloadRepo;

    public ProductService(IProductRepository products, IStorageService storage, IDownloadRepository downloadRepo)
    {
        _products = products;
        _storage = storage;
        _downloadRepo = downloadRepo;
    }

    public async Task<List<ProductDto>> GetAllAsync(CancellationToken ct)
    {
        var list = await _products.GetAllEnabledAsync(ct);
        return list.Select(p => {
            var dto = new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Category = p.Category,
                Creator = p.Creator,
                IsPro = p.IsPro,
                Price = p.Price,
                IsEnabled = p.IsEnabled,
                Tags = p.Tags
            };
            if (!string.IsNullOrEmpty(p.ThumbnailUrl))
            {
                dto.ThumbnailUrl = _storage.GenerateReadSasUrl(p.ThumbnailUrl, TimeSpan.FromHours(24));
            }
            return dto;
        }).ToList();
    }

    public async Task<ProductDetailDto?> GetDetailAsync(Guid id, Guid? userId, CancellationToken ct)
    {
        var p = await _products.GetByIdWithFilesAsync(id, ct);
        if (p == null) return null;

        var detail = new ProductDetailDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Category = p.Category,
            Creator = p.Creator,
            IsPro = p.IsPro,
            Price = p.Price,
            IsEnabled = p.IsEnabled,
            Tags = p.Tags,
            Files = p.Files.Select(f => new ProductFileDto
            {
                Id = f.Id,
                FileType = f.FileType,
                Format = f.Format,
                FileSize = f.FileSize
            }).ToList()
        };

        if (!string.IsNullOrEmpty(p.ThumbnailUrl))
        {
            detail.ThumbnailUrl = _storage.GenerateReadSasUrl(p.ThumbnailUrl, TimeSpan.FromHours(24));
        }

        if (userId.HasValue)
        {
            detail.IsOwnedByUser = await _downloadRepo.HasPaidOrderForProductAsync(userId.Value, id, ct);
            
            var sub = await _downloadRepo.GetActiveSubscriptionWithPlanAsync(userId.Value, ct);
            if (sub != null)
            {
                detail.HasActiveSubscription = true;
                
                // Using monthly reset logic as a placeholder for now
                var ym = DateTime.UtcNow.ToString("yyyy-MM");
                var quota = await _downloadRepo.GetQuotaUsageAsync(userId.Value, ym, ct);
                detail.RemainingDownloads = sub.Plan.MonthlyQuotaDownloads - (quota?.UsedDownloads ?? 0);
            }
        }

        return detail;
    }
}
