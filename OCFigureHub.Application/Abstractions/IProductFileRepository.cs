using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IProductFileRepository
{
    Task AddAsync(ProductFile file, CancellationToken ct);
    Task DeleteByProductAndTypeAsync(Guid productId, OCFigureHub.Domain.Enums.FileType fileType, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
