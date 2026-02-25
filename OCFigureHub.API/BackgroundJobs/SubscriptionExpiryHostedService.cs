using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.API.BackgroundJobs;

public class SubscriptionExpiryHostedService : BackgroundService
{
    private readonly ILogger<SubscriptionExpiryHostedService> _logger;
    private readonly IServiceProvider _sp;

    public SubscriptionExpiryHostedService(
        ILogger<SubscriptionExpiryHostedService> logger,
        IServiceProvider sp)
    {
        _logger = logger;
        _sp = sp;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SubscriptionExpiryHostedService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

                using var scope = _sp.CreateScope();
                var subRepo = scope.ServiceProvider.GetRequiredService<ISubscriptionRepository>();

                var expired = await subRepo.GetExpiredAsync(DateTime.UtcNow, stoppingToken);

                foreach (var sub in expired)
                {
                    sub.IsActive = false;
                    await subRepo.UpdateAsync(sub, stoppingToken);
                }

                if (expired.Count > 0)
                {
                    _logger.LogInformation("Deactivated {Count} expired subscriptions", expired.Count);
                }
            }
            catch (TaskCanceledException)
            {
                // shutting down
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Subscription expiry job failed");
            }
        }
    }
}
