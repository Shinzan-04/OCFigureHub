using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IDownloadRepository
{
    Task<User?> GetUserAsync(Guid userId, CancellationToken ct);

    Task<bool> IsProductEnabledAsync(Guid productId, CancellationToken ct);

    Task<bool> HasPaidOrderForProductAsync(Guid userId, Guid productId, CancellationToken ct);

    Task<Guid?> GetAnyPaidOrderIdAsync(Guid userId, CancellationToken ct);

    Task<Subscription?> GetActiveSubscriptionWithPlanAsync(Guid userId, CancellationToken ct);

    Task<QuotaUsage?> GetQuotaUsageAsync(Guid userId, string yearMonth, CancellationToken ct);

    Task CreateQuotaUsageAsync(QuotaUsage quota, CancellationToken ct);

    Task IncreaseQuotaUsageAsync(QuotaUsage quota, int amount, CancellationToken ct);

    Task<ProductFile?> GetModelFileAsync(Guid productId, string format, CancellationToken ct);

    Task AddDownloadTokenAsync(DownloadToken token, CancellationToken ct);

    Task AddDownloadHistoryAsync(DownloadHistory history, CancellationToken ct);

    Task SaveChangesAsync(CancellationToken ct);
}
