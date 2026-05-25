using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class SavedItemRepository : ISavedItemRepository
{
    private readonly AppDbContext _db;
    public SavedItemRepository(AppDbContext db) => _db = db;

    public async Task<List<SavedItem>> GetByUserIdAsync(Guid userId, CancellationToken ct)
    {
        return await _db.SavedItems
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(ct);
    }

    public async Task<SavedItem?> GetByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        return await _db.SavedItems
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ProductId == productId, ct);
    }

    public async Task<bool> ExistsAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        return await _db.SavedItems
            .AnyAsync(x => x.UserId == userId && x.ProductId == productId, ct);
    }

    public async Task AddAsync(SavedItem item, CancellationToken ct)
    {
        await _db.SavedItems.AddAsync(item, ct);
        await _db.SaveChangesAsync(ct);
    }

    public Task RemoveAsync(SavedItem item, CancellationToken ct)
    {
        _db.SavedItems.Remove(item);
        return _db.SaveChangesAsync(ct);
    }

    public Task RemoveByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        var item = _db.SavedItems
            .Where(x => x.UserId == userId && x.ProductId == productId);
        _db.SavedItems.RemoveRange(item);
        return _db.SaveChangesAsync(ct);
    }
}
