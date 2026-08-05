using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/subscription-plans")]
public class SubscriptionPlansController : ControllerBase
{
    private readonly ISubscriptionPlanRepository _plans;

    public SubscriptionPlansController(ISubscriptionPlanRepository plans)
    {
        _plans = plans;
    }

    /// <summary>
    /// Get all enabled subscription plans (public, no auth)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var list = await _plans.GetAllAsync(ct);
        return Ok(list.Select(p => new
        {
            p.Id,
            p.Name,
            p.MonthlyPrice,
            p.MonthlyQuotaDownloads
        }));
    }

    /// <summary>
    /// Update subscription plan (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSubscriptionPlanRequest req, CancellationToken ct)
    {
        var plan = await _plans.GetByIdAsync(id, ct);
        if (plan == null) return NotFound();

        plan.MonthlyPrice = req.MonthlyPrice;
        plan.MonthlyQuotaDownloads = req.MonthlyQuotaDownloads;

        await _plans.UpdateAsync(plan, ct);
        return Ok(new { message = "Updated successfully" });
    }
}

public class UpdateSubscriptionPlanRequest
{
    public long MonthlyPrice { get; set; }
    public int MonthlyQuotaDownloads { get; set; }
}
