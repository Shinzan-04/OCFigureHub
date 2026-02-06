using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(User user, CancellationToken ct)
        => await _db.Users.AddAsync(user, ct);

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);

    // ⭐ FIX LỖI Ở ĐÂY
    public Task UpdateAsync(User user, CancellationToken ct)
    {
        _db.Users.Update(user);
        return Task.CompletedTask;
    }

}
