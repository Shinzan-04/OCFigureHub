using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.DTOs.AdminStats;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/membership")]
[Authorize(Roles = "Admin")]
public class AdminMembershipController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminMembershipController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetMembershipData(CancellationToken ct)
    {
        // Get all users who have an active or expired subscription
        var subs = await _db.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Plan)
            .ToListAsync(ct);

        var members = subs.Select(s => new AdminMembershipUserDto
        {
            Id = s.UserId,
            Username = s.User.DisplayName ?? s.User.Email,
            Email = s.User.Email,
            Plan = s.Plan?.Name ?? "Unknown",
            Status = s.IsActive && s.EndAt > DateTime.UtcNow ? "Active" : "Expired", // Simplified
            StartDate = s.StartAt,
            EndDate = s.EndAt,
            Amount = s.Plan?.MonthlyPrice ?? 0, // Assumption
            Avatar = s.User.AvatarUrl
        }).ToList();

        // Calculate monthly revenue from subscriptions only (PlanId != null)
        var now = DateTime.UtcNow;
        var monthlyRevenue = new List<AdminMonthlyRevenueDto>();

        for (int i = 7; i >= 0; i--)
        {
            var start = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var end = start.AddMonths(1);
            
            var rev = await _db.Orders
                .Where(o => o.Status == OCFigureHub.Domain.Enums.OrderStatus.Paid 
                         && o.PlanId != null 
                         && o.PaidAt >= start 
                         && o.PaidAt < end)
                .SumAsync(o => o.TotalAmount, ct);

            monthlyRevenue.Add(new AdminMonthlyRevenueDto
            {
                Month = start.ToString("MMM"),
                Revenue = rev
            });
        }

        var result = new AdminMembershipResponseDto
        {
            Members = members,
            MonthlyRevenue = monthlyRevenue
        };

        return Ok(result);
    }
}
