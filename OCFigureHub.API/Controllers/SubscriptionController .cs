using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Subscriptions;
using OCFigureHub.Application.Services;
using System.Security.Claims;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/subscriptions")]
[Authorize(Roles = "Customer")]
public class SubscriptionController : ControllerBase
{
    private readonly SubscriptionService _service;

    public SubscriptionController(SubscriptionService service)
    {
        _service = service;
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto req, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var res = await _service.SubscribeAsync(userId, req, ct);
        return Ok(res);
    }
}
