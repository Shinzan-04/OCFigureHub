using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class QuotaRepository : IQuotaRepository
{
    private readonly AppDbContext _db;
    public QuotaRepository(AppDbContext db) => _db = db;

    public Task<QuotaUsage?> GetByUserAndMonthAsync(Guid userId, string yearMonth, CancellationToken ct)
        => _db.QuotaUsages.FirstOrDefaultAsync(x => x.UserId == userId && x.YearMonth == yearMonth, ct);

    public async Task AddAsync(QuotaUsage quota, CancellationToken ct)
    {
        _db.QuotaUsages.Add(quota);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(QuotaUsage quota, CancellationToken ct)
    {
        _db.QuotaUsages.Update(quota);
        await _db.SaveChangesAsync(ct);
    }

    public async Task ResetMonthlyAsync(string yearMonth, CancellationToken ct)
    {
        // Nếu muốn reset theo "tháng mới" thì thực tế sẽ tạo record mới khi download
        // Ở đây demo: set UsedDownloads = 0 cho các record cùng month
        var list = await _db.QuotaUsages
            .Where(x => x.YearMonth == yearMonth)
            .ToListAsync(ct);

        foreach (var q in list)
        {
            q.UsedDownloads = 0;
            q.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
    }
}
