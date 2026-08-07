using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class ProductFileRepository : IProductFileRepository
{
    private readonly AppDbContext _db;
    public ProductFileRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(ProductFile file, CancellationToken ct)
        => await _db.ProductFiles.AddAsync(file, ct);

    public async Task DeleteByProductAndTypeAsync(Guid productId, OCFigureHub.Domain.Enums.FileType fileType, CancellationToken ct)
    {
        var existingFiles = _db.ProductFiles.Where(f => f.ProductId == productId && f.FileType == fileType);
        _db.ProductFiles.RemoveRange(existingFiles);
        await Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
