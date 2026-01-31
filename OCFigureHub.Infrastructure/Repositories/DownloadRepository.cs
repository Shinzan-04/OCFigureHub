using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class DownloadRepository : IDownloadRepository
{
    private readonly AppDbContext _db;

    public DownloadRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<User?> GetUserAsync(Guid userId, CancellationToken ct)
        => _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);

    public Task<bool> IsProductEnabledAsync(Guid productId, CancellationToken ct)
        => _db.Products.AnyAsync(x => x.Id == productId && x.IsEnabled, ct);

    public Task<bool> HasPaidOrderForProductAsync(Guid userId, Guid productId, CancellationToken ct)
        => _db.OrderItems
            .Include(x => x.Order)
            .AnyAsync(x =>
                x.ProductId == productId &&
                x.Order.UserId == userId &&
                x.Order.Status == OrderStatus.Paid, ct);

    public Task<Guid?> GetAnyPaidOrderIdAsync(Guid userId, CancellationToken ct)
        => _db.Orders
            .Where(o => o.UserId == userId && o.Status == OrderStatus.Paid)
            .Select(o => (Guid?)o.Id)
            .FirstOrDefaultAsync(ct);

    public Task<Subscription?> GetActiveSubscriptionWithPlanAsync(Guid userId, CancellationToken ct)
        => _db.Subscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.UserId == userId && s.IsActive, ct);

    public Task<QuotaUsage?> GetQuotaUsageAsync(Guid userId, string yearMonth, CancellationToken ct)
        => _db.QuotaUsages.FirstOrDefaultAsync(q => q.UserId == userId && q.YearMonth == yearMonth, ct);

    public async Task CreateQuotaUsageAsync(QuotaUsage quota, CancellationToken ct)
        => await _db.QuotaUsages.AddAsync(quota, ct);

    public Task IncreaseQuotaUsageAsync(QuotaUsage quota, int amount, CancellationToken ct)
    {
        quota.UsedDownloads += amount;
        quota.UpdatedAt = DateTime.UtcNow;
        return Task.CompletedTask;
    }

    public Task<ProductFile?> GetModelFileAsync(Guid productId, string format, CancellationToken ct)
    {
        var fmt = format.ToUpper();
        return _db.ProductFiles.FirstOrDefaultAsync(f =>
            f.ProductId == productId &&
            f.FileType == FileType.Model &&
            f.Format.ToUpper() == fmt, ct);
    }

    public async Task AddDownloadTokenAsync(DownloadToken token, CancellationToken ct)
        => await _db.DownloadTokens.AddAsync(token, ct);

    public async Task AddDownloadHistoryAsync(DownloadHistory history, CancellationToken ct)
        => await _db.DownloadHistories.AddAsync(history, ct);

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
