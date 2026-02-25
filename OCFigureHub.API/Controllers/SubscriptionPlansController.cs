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
}
