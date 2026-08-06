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
    private readonly OCFigureHub.Application.Abstractions.IStorageService _storage;

    public AnalyticsController(AppDbContext db, OCFigureHub.Application.Abstractions.IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    /// <summary>Monthly trends (downloads, revenue, new users) for last N months</summary>
    [HttpGet("monthly-trends")]
    public async Task<IActionResult> MonthlyTrends([FromQuery] int months = 8, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var results = new List<object>();

        var minDate = new DateTime(now.Year, now.Month, 1).AddMonths(-(months - 1));
        var maxDate = minDate.AddMonths(months);

        var downloadsData = await _db.DownloadHistories
            .Where(d => d.DownloadedAt >= minDate && d.DownloadedAt < maxDate)
            .GroupBy(d => new { d.DownloadedAt.Year, d.DownloadedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        var revenueData = await _db.PaymentTransactions
            .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid && p.CreatedAt >= minDate && p.CreatedAt < maxDate)
            .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(x => (decimal?)x.Amount ?? 0) })
            .ToListAsync(ct);

        var usersData = await _db.Users
            .Where(u => u.CreatedAt >= minDate && u.CreatedAt < maxDate)
            .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        for (int i = months - 1; i >= 0; i--)
        {
            var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthLabel = start.ToString("MMM");

            var downloads = downloadsData.FirstOrDefault(d => d.Year == start.Year && d.Month == start.Month)?.Count ?? 0;
            var revenue = revenueData.FirstOrDefault(r => r.Year == start.Year && r.Month == start.Month)?.Revenue ?? 0;
            var newUsers = usersData.FirstOrDefault(u => u.Year == start.Year && u.Month == start.Month)?.Count ?? 0;

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

    /// <summary>Activity (Week/Month/Year)</summary>
    [HttpGet("activity")]
    public async Task<IActionResult> Activity([FromQuery] string period = "week", CancellationToken ct = default)
    {
        var results = new List<object>();
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.ToLower() == "year")
            startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-11);
        else if (period.ToLower() == "month")
            startDate = now.Date.AddDays(-29);
        else
            startDate = now.Date.AddDays(-6);

        var groupQuery = _db.DownloadHistories.Where(d => d.DownloadedAt >= startDate);

        if (period.ToLower() == "year")
        {
            var aggregated = await groupQuery
                .GroupBy(d => new { d.DownloadedAt.Year, d.DownloadedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync(ct);

            for (int i = 11; i >= 0; i--)
            {
                var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                var downloads = aggregated.FirstOrDefault(x => x.Year == start.Year && x.Month == start.Month)?.Count ?? 0;
                results.Add(new { day = start.ToString("MMM"), views = downloads * 4, downloads });
            }
        }
        else
        {
            var aggregated = await groupQuery
                .GroupBy(d => new { d.DownloadedAt.Year, d.DownloadedAt.Month, d.DownloadedAt.Day })
                .Select(g => new { g.Key.Year, g.Key.Month, g.Key.Day, Count = g.Count() })
                .ToListAsync(ct);

            if (period.ToLower() == "month")
            {
                for (int i = 29; i >= 0; i--)
                {
                    var date = now.Date.AddDays(-i);
                    var downloads = aggregated.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month && x.Day == date.Day)?.Count ?? 0;
                    results.Add(new { day = date.ToString("dd/MM"), views = downloads * 4, downloads });
                }
            }
            else
            {
                var days = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
                for (int i = 6; i >= 0; i--)
                {
                    var date = now.Date.AddDays(-i);
                    var dayName = days[(int)date.DayOfWeek == 0 ? 6 : (int)date.DayOfWeek - 1];
                    var downloads = aggregated.FirstOrDefault(x => x.Year == date.Year && x.Month == date.Month && x.Day == date.Day)?.Count ?? 0;
                    results.Add(new { day = dayName, views = downloads * 4, downloads });
                }
            }
        }

        return Ok(results);
    }

    /// <summary>Top products by download count</summary>
    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts([FromQuery] string period = "week", [FromQuery] int limit = 10, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.ToLower() == "year")
            startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-11);
        else if (period.ToLower() == "month")
            startDate = now.Date.AddDays(-29);
        else
            startDate = now.Date.AddDays(-6);

        var products = await _db.DownloadHistories
            .Where(d => d.DownloadedAt >= startDate)
            .GroupBy(d => d.ProductId)
            .Select(g => new { ProductId = g.Key, Downloads = g.Count() })
            .OrderByDescending(x => x.Downloads)
            .Take(limit)
            .ToListAsync(ct);

        var productIds = products.Select(p => p.ProductId).ToList();
        var productDetails = await _db.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Name, p.ThumbnailUrl, p.Category, p.Price, CreatorName = p.Creator })
            .ToListAsync(ct);

        var result = products.Select(p =>
        {
            var detail = productDetails.FirstOrDefault(d => d.Id == p.ProductId);
            var thumbUrl = detail?.ThumbnailUrl;
            if (!string.IsNullOrEmpty(thumbUrl))
            {
                thumbUrl = _storage.GenerateReadSasUrl(thumbUrl, TimeSpan.FromHours(24));
            }
            return new
            {
                id = p.ProductId,
                name = detail?.Name ?? "Unknown",
                thumbnailUrl = thumbUrl,
                category = detail?.Category,
                price = detail?.Price ?? 0,
                creator = detail?.CreatorName ?? "Unknown",
                downloads = p.Downloads
            };
        });

        return Ok(result);
    }

    /// <summary>Category distribution (pie chart)</summary>
    [HttpGet("category-distribution")]
    public async Task<IActionResult> CategoryDistribution([FromQuery] string period = "week", CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.ToLower() == "year")
            startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-11);
        else if (period.ToLower() == "month")
            startDate = now.Date.AddDays(-29);
        else
            startDate = now.Date.AddDays(-6);

        var colors = new[] { "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#F97316" };

        var distribution = await _db.Products
            .Where(p => p.IsEnabled && p.CreatedAt >= startDate)
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

    /// <summary>Scoped Dashboard Stats</summary>
    [HttpGet("dashboard-stats")]
    public async Task<IActionResult> DashboardStats([FromQuery] string period = "week", CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;

        if (period.ToLower() == "year")
            startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-11);
        else if (period.ToLower() == "month")
            startDate = now.Date.AddDays(-29);
        else
            startDate = now.Date.AddDays(-6);

        var totalProducts = await _db.Products.CountAsync(p => p.CreatedAt >= startDate, ct);
        var totalDownloads = await _db.DownloadHistories.CountAsync(d => d.DownloadedAt >= startDate, ct);
        var totalUsers = await _db.Users.CountAsync(u => u.CreatedAt >= startDate, ct);
        var totalRevenue = await _db.PaymentTransactions
            .Where(p => p.Status == OCFigureHub.Domain.Enums.PaymentStatus.Paid && p.CreatedAt >= startDate)
            .SumAsync(p => (decimal?)p.Amount ?? 0, ct);

        return Ok(new { totalProducts, totalUsers, totalDownloads, totalRevenue });
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
