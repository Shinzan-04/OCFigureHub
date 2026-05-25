using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.SavedItems;
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Services;

public class SavedItemService : ISavedItemService
{
    private readonly ISavedItemRepository _savedRepo;
    private readonly IProductRepository _productRepo;
    private readonly IStorageService _storage;

    public SavedItemService(
        ISavedItemRepository savedRepo,
        IProductRepository productRepo,
        IStorageService storage)
    {
        _savedRepo = savedRepo;
        _productRepo = productRepo;
        _storage = storage;
    }

    public async Task<List<SavedItemDto>> GetSavedItemsAsync(Guid userId, CancellationToken ct)
    {
        var savedItems = await _savedRepo.GetByUserIdAsync(userId, ct);
        if (savedItems.Count == 0) return new List<SavedItemDto>();

        var productIds = savedItems.Select(s => s.ProductId).ToList();
        var products = await _productRepo.GetByIdsAsync(productIds, ct);
        var productMap = products.ToDictionary(p => p.Id);

        return savedItems
            .Where(s => productMap.ContainsKey(s.ProductId))
            .Select(s =>
            {
                var p = productMap[s.ProductId];
                return new SavedItemDto
                {
                    Id = s.Id,
                    ProductId = p.Id,
                    ProductName = p.Name,
                    Category = p.Category,
                    Creator = p.Creator,
                    Price = p.Price,
                    IsPro = p.IsPro,
                    License = p.License.ToString(),
                    SavedAt = s.SavedAt,
                    ThumbnailUrl = !string.IsNullOrEmpty(p.ThumbnailUrl)
                        ? _storage.GenerateReadSasUrl(p.ThumbnailUrl, TimeSpan.FromHours(1))
                        : null,
                    PreviewModelUrl = !string.IsNullOrEmpty(p.PreviewModelUrl)
                        ? _storage.GenerateReadSasUrl(p.PreviewModelUrl, TimeSpan.FromHours(1))
                        : null,
                };
            })
            .ToList();
    }

    public async Task<bool> IsSavedAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        return await _savedRepo.ExistsAsync(userId, productId, ct);
    }

    public async Task SaveItemAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        var exists = await _savedRepo.ExistsAsync(userId, productId, ct);
        if (exists) return;

        var product = await _productRepo.GetByIdAsync(productId, ct);
        if (product == null)
            throw new KeyNotFoundException($"Product with id {productId} not found.");

        var item = new SavedItem
        {
            UserId = userId,
            ProductId = productId,
            SavedAt = DateTime.UtcNow
        };

        await _savedRepo.AddAsync(item, ct);
    }

    public async Task RemoveItemAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        await _savedRepo.RemoveByUserAndProductAsync(userId, productId, ct);
    }
}
