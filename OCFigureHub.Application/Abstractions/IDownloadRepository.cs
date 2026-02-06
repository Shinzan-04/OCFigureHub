using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IDownloadRepository
{
    // User / Product
    Task<User?> GetUserAsync(Guid userId, CancellationToken ct);
    Task<bool> IsProductEnabledAsync(Guid productId, CancellationToken ct);

    // Orders
    Task<bool> HasPaidOrderForProductAsync(Guid userId, Guid productId, CancellationToken ct);
    Task<Guid?> GetAnyPaidOrderIdAsync(Guid userId, CancellationToken ct);

    // Subscription
    Task<Subscription?> GetActiveSubscriptionWithPlanAsync(Guid userId, CancellationToken ct);

    // Quota
    Task<QuotaUsage?> GetQuotaUsageAsync(Guid userId, string yearMonth, CancellationToken ct);
    Task CreateQuotaUsageAsync(QuotaUsage quota, CancellationToken ct);
    Task IncreaseQuotaUsageAsync(QuotaUsage quota, int amount, CancellationToken ct);

    // Files
    Task<ProductFile?> GetModelFileAsync(Guid productId, string format, CancellationToken ct);

    // Download security
    Task AddDownloadTokenAsync(DownloadToken token, CancellationToken ct);
    Task AddDownloadHistoryAsync(DownloadHistory history, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}
