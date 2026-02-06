using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OCFigureHub.Application.Abstractions.Jobs;

namespace OCFigureHub.API.BackgroundJobs;

public class MonthlyQuotaResetHostedService : BackgroundService
{
    private readonly ILogger<MonthlyQuotaResetHostedService> _logger;
    private readonly IServiceProvider _sp;

    public MonthlyQuotaResetHostedService(
        ILogger<MonthlyQuotaResetHostedService> logger,
        IServiceProvider sp)
    {
        _logger = logger;
        _sp = sp;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("MonthlyQuotaResetHostedService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // check mỗi 1 giờ
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

                var now = DateTime.UtcNow;

                // reset vào ngày 1 (UTC) lúc gần 00:00 (đơn giản)
                if (now.Day == 1 && now.Hour == 0)
                {
                    using var scope = _sp.CreateScope();
                    var job = scope.ServiceProvider.GetRequiredService<QuotaResetJob>();

                    await job.RunMonthlyResetAsync(stoppingToken);

                    _logger.LogInformation("Quota reset executed for month {Month}", now.ToString("yyyy-MM"));
                }
            }
            catch (TaskCanceledException)
            {
                // ignore
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Quota reset job failed");
            }
        }
    }
}
