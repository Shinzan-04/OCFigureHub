using OCFigureHub.Application.DTOs.SavedItems;

namespace OCFigureHub.Application.Abstractions;

public interface ISavedItemService
{
    Task<List<SavedItemDto>> GetSavedItemsAsync(Guid userId, CancellationToken ct);
    Task<bool> IsSavedAsync(Guid userId, Guid productId, CancellationToken ct);
    Task SaveItemAsync(Guid userId, Guid productId, CancellationToken ct);
    Task RemoveItemAsync(Guid userId, Guid productId, CancellationToken ct);
}
