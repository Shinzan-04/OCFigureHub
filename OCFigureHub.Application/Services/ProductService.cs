using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Common;
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
        return list.Select(p => MapToDto(p)).ToList();
    }

    public async Task<PagedResult<ProductDto>> GetPagedAsync(ProductQueryRequest request, CancellationToken ct)
    {
        // Validate search length
        if (!string.IsNullOrWhiteSpace(request.Search) && request.Search.Length > 200)
        {
            throw new ArgumentException("Search query too long (max 200 characters)");
        }

        // Validate format if provided
        if (!string.IsNullOrWhiteSpace(request.Format))
        {
            var validFormats = new[] { "GLB", "GLTF", "STL", "OBJ", "FBX", "ZIP" };
            if (!validFormats.Contains(request.Format.ToUpper()))
            {
                throw new ArgumentException($"Invalid format. Valid formats: {string.Join(", ", validFormats)}");
            }
        }

        // Validate license if provided
        if (!string.IsNullOrWhiteSpace(request.License))
        {
            if (!Enum.TryParse<Domain.Enums.LicenseType>(request.License, true, out _))
            {
                throw new ArgumentException("Invalid license. Valid values: Personal, Commercial");
            }
        }

        var (items, totalCount) = await _products.GetPagedAsync(request, ct);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : (request.PageSize > 100 ? 100 : request.PageSize);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<ProductDto>
        {
            Items = items.Select(p => MapToDto(p)).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalItems = totalCount,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }

    private ProductDto MapToDto(Domain.Entities.Product p)
    {
        var dto = new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Category = p.Category,
            Creator = p.Creator,
            IsPro = p.IsPro,
            Price = p.Price,
            IsEnabled = p.IsEnabled,
            Tags = p.Tags,
            License = p.License.ToString()
        };
        if (!string.IsNullOrEmpty(p.ThumbnailUrl))
        {
            dto.ThumbnailUrl = _storage.GenerateReadSasUrl(p.ThumbnailUrl, TimeSpan.FromHours(24));
        }
        if (!string.IsNullOrEmpty(p.PreviewModelUrl))
        {
            dto.PreviewModelUrl = _storage.GenerateReadSasUrl(p.PreviewModelUrl, TimeSpan.FromHours(24));
        }
        return dto;
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
            License = p.License.ToString(),
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
        if (!string.IsNullOrEmpty(p.PreviewModelUrl))
        {
            detail.PreviewModelUrl = _storage.GenerateReadSasUrl(p.PreviewModelUrl, TimeSpan.FromHours(24));
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
