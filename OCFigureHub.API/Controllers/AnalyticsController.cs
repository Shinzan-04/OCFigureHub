using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db) => _db = db;

    /// <summary>Monthly trends (downloads, revenue, new users) for last N months</summary>
    [HttpGet("monthly-trends")]
    public async Task<IActionResult> MonthlyTrends([FromQuery] int months = 8, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var results = new List<object>();

        for (int i = months - 1; i >= 0; i--)
        {
            var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var end = start.AddMonths(1);
            var monthLabel = start.ToString("MMM");

            var downloads = await _db.DownloadHistories
                .CountAsync(d => d.DownloadedAt >= start && d.DownloadedAt < end, ct);

            var revenue = await _db.PaymentTransactions
                .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid && p.CreatedAt >= start && p.CreatedAt < end)
                .SumAsync(p => (decimal?)p.Amount ?? 0, ct);

            var newUsers = await _db.Users
                .CountAsync(u => u.CreatedAt >= start && u.CreatedAt < end, ct);

            results.Add(new
            {
                month = monthLabel,
                downloads,
                revenue = (double)revenue,
                users = newUsers
            });
        }

        return Ok(results);
    }

    /// <summary>Weekly activity (last 7 days)</summary>
    [HttpGet("weekly-activity")]
    public async Task<IActionResult> WeeklyActivity(CancellationToken ct)
    {
        var results = new List<object>();
        var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };

        for (int i = 6; i >= 0; i--)
        {
            var date = DateTime.UtcNow.Date.AddDays(-i);
            var nextDate = date.AddDays(1);
            var dayName = days[(int)date.DayOfWeek == 0 ? 6 : (int)date.DayOfWeek - 1];

            var downloads = await _db.DownloadHistories
                .CountAsync(d => d.DownloadedAt >= date && d.DownloadedAt < nextDate, ct);

            // Views = downloads * ~3-5 (estimate, since we don't track page views)
            var views = downloads * 4;

            results.Add(new { day = dayName, views, downloads });
        }

        return Ok(results);
    }

    /// <summary>Top products by download count</summary>
    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts([FromQuery] int limit = 10, CancellationToken ct = default)
    {
        var products = await _db.DownloadHistories
            .GroupBy(d => d.ProductId)
            .Select(g => new { ProductId = g.Key, Downloads = g.Count() })
            .OrderByDescending(x => x.Downloads)
            .Take(limit)
            .ToListAsync(ct);

        var productIds = products.Select(p => p.ProductId).ToList();
        var productDetails = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name, p.ThumbnailUrl, p.Category, p.Price })
            .ToListAsync(ct);

        var result = products.Select(p =>
        {
            var detail = productDetails.FirstOrDefault(d => d.Id == p.ProductId);
            return new
            {
                productId = p.ProductId,
                name = detail?.Name ?? "Unknown",
                thumbnailUrl = detail?.ThumbnailUrl,
                category = detail?.Category,
                price = detail?.Price ?? 0,
                downloads = p.Downloads
            };
        });

        return Ok(result);
    }

    /// <summary>Category distribution (pie chart)</summary>
    [HttpGet("category-distribution")]
    public async Task<IActionResult> CategoryDistribution(CancellationToken ct)
    {
        var colors = new[] { "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316" };

        var distribution = await _db.Products
            .Where(p => p.IsEnabled)
            .GroupBy(p => p.Category)
            .Select(g => new { name = g.Key, value = g.Count() })
            .OrderByDescending(x => x.value)
            .ToListAsync(ct);

        var result = distribution.Select((d, i) => new
        {
            d.name,
            d.value,
            color = colors[i % colors.Length]
        });

        return Ok(result);
    }

    /// <summary>Revenue summary</summary>
    [HttpGet("revenue-summary")]
    public async Task<IActionResult> RevenueSummary(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var thisMonth = new DateTime(now.Year, now.Month, 1);
        var lastMonth = thisMonth.AddMonths(-1);

        var thisMonthRevenue = await _db.PaymentTransactions
            .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid && p.CreatedAt >= thisMonth)
            .SumAsync(p => (decimal?)p.Amount ?? 0, ct);

        var lastMonthRevenue = await _db.PaymentTransactions
            .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid && p.CreatedAt >= lastMonth && p.CreatedAt < thisMonth)
            .SumAsync(p => (decimal?)p.Amount ?? 0, ct);

        var totalRevenue = await _db.PaymentTransactions
            .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid)
            .SumAsync(p => (decimal?)p.Amount ?? 0, ct);

        var growthPercent = lastMonthRevenue > 0
            ? Math.Round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100, 1)
            : 0;

        return Ok(new
        {
            thisMonth = (double)thisMonthRevenue,
            lastMonth = (double)lastMonthRevenue,
            total = (double)totalRevenue,
            growthPercent = (double)growthPercent
        });
    }
}
