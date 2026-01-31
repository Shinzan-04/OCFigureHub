using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Orders;
using OCFigureHub.Application.Services;
using System.Security.Claims;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer,Admin")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orders;

    public OrdersController(OrderService orders)
    {
        _orders = orders;
    }

    [HttpPost("buy-now")]
    public async Task<IActionResult> BuyNow([FromBody] BuyNowRequest req, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var res = await _orders.BuyNowPaidImmediatelyAsync(userId, req, ct);
        return Ok(res);
    }
}
