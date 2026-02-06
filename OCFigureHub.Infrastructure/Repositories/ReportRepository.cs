using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.Jobs;
using OCFigureHub.Domain.Enums;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly AppDbContext _db;
    public ReportRepository(AppDbContext db) => _db = db;

    public async Task<(decimal revenue, int paidOrders)> GetSalesAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct)
    {
        var paidOrders = await _db.Orders
            .Where(o => o.Status == OrderStatus.Paid && o.PaidAt >= fromUtc && o.PaidAt <= toUtc)
            .ToListAsync(ct);

        var revenue = paidOrders.Sum(o => o.TotalAmount);
        return (revenue, paidOrders.Count);
    }

    public async Task<(int success, int fail, int uniqueUsers)> GetDownloadsAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct)
    {
        var q = _db.DownloadHistories.Where(d => d.CreatedAt >= fromUtc && d.CreatedAt <= toUtc);

        var success = await q.CountAsync(x => x.Success, ct);
        var fail = await q.CountAsync(x => !x.Success, ct);
        var uniqueUsers = await q.Select(x => x.UserId).Distinct().CountAsync(ct);

        return (success, fail, uniqueUsers);
    }
}
