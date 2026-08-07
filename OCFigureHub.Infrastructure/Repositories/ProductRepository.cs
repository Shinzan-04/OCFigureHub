using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using OCFigureHub.Infrastructure.Persistence;
using OCFigureHub.Application.Helpers;

namespace OCFigureHub.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<Product>> GetAllEnabledAsync(CancellationToken ct)
        => await _db.Products
              .Where(x => x.IsEnabled)
              .OrderByDescending(x => x.CreatedAt)
              .ToListAsync(ct);

    public async Task<List<Product>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct)
        => await _db.Products
              .Where(x => ids.Contains(x.Id) && x.IsEnabled)
              .ToListAsync(ct);

    public async Task<(List<Product> items, int totalCount)> GetPagedAsync(ProductQueryRequest request, CancellationToken ct)
    {
        // Validate and sanitize inputs
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : (request.PageSize > 100 ? 100 : request.PageSize);
        var search = request.Search?.Trim();

        // Validate price range
        if (request.MinPrice.HasValue && request.MaxPrice.HasValue && request.MinPrice > request.MaxPrice)
        {
            throw new ArgumentException("MinPrice cannot be greater than MaxPrice");
        }

        // Start with enabled products
        IQueryable<Product> query = _db.Products.Where(x => x.IsEnabled);

        // Apply filters (non-search filters first to narrow down)
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var lowerCat = request.Category.ToLower();
            query = query.Where(x => x.Category.ToLower() == lowerCat);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(x => x.Price >= request.MinPrice.Value);
        }
        if (request.MaxPrice.HasValue)
        {
            query = query.Where(x => x.Price <= request.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Format))
        {
            var lowerFormat = request.Format.ToLower();
            query = query.Where(x => x.Files.Any(f => f.Format.ToLower() == lowerFormat));
        }

        if (!string.IsNullOrWhiteSpace(request.License))
        {
            var licenseTrimmed = request.License.Trim();
            if (Enum.TryParse<LicenseType>(licenseTrimmed, true, out var parsedLicense))
            {
                query = query.Where(x => x.License == parsedLicense);
            }
        }

        // SMART SEARCH LOGIC
        if (request.Smart && !string.IsNullOrWhiteSpace(search))
        {
            var analysis = SearchHelper.Analyze(search);
            
            LicenseType? searchLicense = null;
            if (!string.IsNullOrEmpty(analysis.License) && Enum.TryParse<LicenseType>(analysis.License, true, out var parsedLicense))
            {
                searchLicense = parsedLicense;
            }

            var lowerSearch = search.ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(lowerSearch) ||
                x.Tags.ToLower().Contains(lowerSearch) ||
                x.Description.ToLower().Contains(lowerSearch) ||
                x.Creator.ToLower().Contains(lowerSearch) ||
                (analysis.IsFree == true && x.Price == 0) ||
                (analysis.IsPro == true && x.IsPro) ||
                (analysis.Categories.Count > 0 && analysis.Categories.Contains(x.Category)) ||
                (searchLicense != null && x.License == searchLicense)
            );

            // Load to memory (cap at 1000 for performance)
            var candidates = await query.Take(1000).ToListAsync(ct);
            
            // Score candidates
            var scoredItems = candidates
                .Select(p => new { Item = p, Score = SearchHelper.CalculateScore(p, analysis) })
                .Where(x => x.Score > 0);

            // Apply sorting
            var sort = request.Sort?.ToLower() ?? "relevance";
            var ordered = sort switch
            {
                "price_asc" => scoredItems.OrderBy(x => x.Item.Price).ThenByDescending(x => x.Score),
                "price_desc" => scoredItems.OrderByDescending(x => x.Item.Price).ThenByDescending(x => x.Score),
                "popular" => scoredItems.OrderByDescending(x => x.Item.DownloadHistories.Count).ThenByDescending(x => x.Score),
                "newest" => scoredItems.OrderByDescending(x => x.Item.CreatedAt).ThenByDescending(x => x.Score),
                _ => scoredItems.OrderByDescending(x => x.Score).ThenByDescending(x => x.Item.CreatedAt)
            };

            var totalCount = ordered.Count();
            var items = ordered
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => x.Item)
                .ToList();

            return (items, totalCount);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lowerSearch = search.ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(lowerSearch) ||
                x.Description.ToLower().Contains(lowerSearch) ||
                x.Tags.ToLower().Contains(lowerSearch)
            );
        }

        // Apply sorting for basic logic
        var baseSort = request.Sort?.ToLower() ?? "newest";
        query = baseSort switch
        {
            "price_asc" => query.OrderBy(x => x.Price).ThenByDescending(x => x.CreatedAt),
            "price_desc" => query.OrderByDescending(x => x.Price).ThenByDescending(x => x.CreatedAt),
            "popular" => query.OrderByDescending(x => x.DownloadHistories.Count).ThenByDescending(x => x.CreatedAt),
            "newest" => query.OrderByDescending(x => x.CreatedAt),
            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        var totalItemsCount = await query.CountAsync(ct);
        var pagedItems = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (pagedItems, totalItemsCount);
    }

    public Task<Product?> GetByIdWithFilesAsync(Guid id, CancellationToken ct)
        => _db.Products
              .Include(x => x.Files)
              .FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(Product product, CancellationToken ct)
        => await _db.Products.AddAsync(product, ct);

    public Task UpdateAsync(Product product, CancellationToken ct)
    {
        _db.Products.Update(product);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Product product, CancellationToken ct)
    {
        _db.Products.Remove(product);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
