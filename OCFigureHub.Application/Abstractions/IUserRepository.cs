using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(User user, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);

    Task UpdateAsync(User user, CancellationToken ct);

    Task<List<User>> GetAllAsync(int page, int pageSize, string? search, CancellationToken ct);
    Task<int> GetCountAsync(string? search, CancellationToken ct);
}
