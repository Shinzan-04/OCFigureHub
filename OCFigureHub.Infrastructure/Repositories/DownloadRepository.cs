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

    // ================= USER =================

    public async Task<User?> GetUserAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Users
            .FirstOrDefaultAsync(x => x.Id == userId, ct);
    }

    // ================= PRODUCT =================

    public async Task<bool> IsProductEnabledAsync(Guid productId, CancellationToken ct)
    {
        return await _db.Products
            .AnyAsync(x => x.Id == productId && x.IsEnabled, ct);
    }

    // ================= ORDERS =================

    public async Task<bool> HasPaidOrderForProductAsync(Guid userId, Guid productId, CancellationToken ct)
    {
        return await _db.OrderItems
            .Include(x => x.Order)
            .AnyAsync(x =>
                x.ProductId == productId &&
                x.Order.UserId == userId &&
                x.Order.Status == OrderStatus.Paid,
                ct);
    }

    public async Task<Guid?> GetAnyPaidOrderIdAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Orders
            .Where(x => x.UserId == userId && x.Status == OrderStatus.Paid)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(ct);
    }

    // ================= SUBSCRIPTION =================

    public async Task<Subscription?> GetActiveSubscriptionWithPlanAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Subscriptions
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive &&
                x.EndAt> DateTime.UtcNow,
                ct);
    }

    // ================= QUOTA =================

    public async Task<QuotaUsage?> GetQuotaUsageAsync(Guid userId, string yearMonth, CancellationToken ct)
    {
        return await _db.QuotaUsages
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.YearMonth == yearMonth,
                ct);
    }

    public async Task CreateQuotaUsageAsync(QuotaUsage quota, CancellationToken ct)
    {
        _db.QuotaUsages.Add(quota);
        await _db.SaveChangesAsync(ct);
    }

    public async Task IncreaseQuotaUsageAsync(QuotaUsage quota, int amount, CancellationToken ct)
    {
        quota.UsedDownloads += amount;
        _db.QuotaUsages.Update(quota);
        await _db.SaveChangesAsync(ct);
    }

    // ================= FILE =================

    public async Task<ProductFile?> GetModelFileAsync(Guid productId, string format, CancellationToken ct)
    {
        return await _db.ProductFiles.FirstOrDefaultAsync(f =>
            f.ProductId == productId &&
            f.FileType == FileType.Model &&
            f.Format.ToUpper() == format.ToUpper(),
            ct);
    }

    // ================= DOWNLOAD SECURITY =================

    public async Task AddDownloadTokenAsync(DownloadToken token, CancellationToken ct)
    {
        _db.DownloadTokens.Add(token);
        await _db.SaveChangesAsync(ct);
    }

    public async Task AddDownloadHistoryAsync(DownloadHistory history, CancellationToken ct)
    {
        _db.DownloadHistories.Add(history);
        await _db.SaveChangesAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
