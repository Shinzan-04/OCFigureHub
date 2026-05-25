using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface ISavedItemRepository
{
    Task<List<SavedItem>> GetByUserIdAsync(Guid userId, CancellationToken ct);
    Task<SavedItem?> GetByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct);
    Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct);
    Task AddAsync(SavedItem item, CancellationToken ct);
    Task RemoveAsync(SavedItem item, CancellationToken ct);
    Task RemoveByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct);
}
