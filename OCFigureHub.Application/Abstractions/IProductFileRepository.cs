using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IProductFileRepository
{
    Task AddAsync(ProductFile file, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
