using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController : ControllerBase
{
    private readonly IOrderRepository _orders;

    public AdminOrdersController(IOrderRepository orders)
    {
        _orders = orders;
    }

    /// <summary>
    /// List all orders with pagination (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var orders = await _orders.GetAllOrdersAsync(page, pageSize, ct);
        var total = await _orders.GetOrderCountAsync(ct);

        return Ok(new
        {
            items = orders.Select(o => new
            {
                o.Id,
                o.UserId,
                UserEmail = o.User?.Email,
                UserName = o.User?.DisplayName,
                Status = (o.Status == Domain.Enums.OrderStatus.Pending && (DateTime.UtcNow - o.CreatedAt).TotalHours > 1)
                    ? Domain.Enums.OrderStatus.Expired.ToString()
                    : o.Status.ToString(),
                o.TotalAmount,
                PlanName = o.Plan?.Name,
                o.CreatedAt,
                o.PaidAt,
                ItemCount = o.Items?.Count ?? 0
            }),
            page,
            pageSize,
            totalItems = total,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }
}
