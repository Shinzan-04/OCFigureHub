using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Orders;
using OCFigureHub.Application.Services;
using OCFigureHub.Infrastructure.Persistence;
using System.Security.Claims;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer,Admin")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orders;
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;

    public OrdersController(OrderService orders, AppDbContext db, IStorageService storage)
    {
        _orders = orders;
        _db = db;
        _storage = storage;
    }

    [HttpPost("buy-now")]
    public async Task<IActionResult> BuyNow([FromBody] BuyNowRequest req, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var res = await _orders.BuyNowPaidImmediatelyAsync(userId, req, ct);
        return Ok(res);
    }

    /// <summary>Get current user's order history</summary>
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Plan)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);

        var orders = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var result = orders.Select(o => new
        {
            o.Id,
            Status = (o.Status == Domain.Enums.OrderStatus.Pending && (DateTime.UtcNow - o.CreatedAt).TotalHours > 1) 
                ? Domain.Enums.OrderStatus.Expired.ToString() 
                : o.Status.ToString(),
            o.TotalAmount,
            o.CreatedAt,
            o.PaidAt,
            PlanName = o.Plan != null ? o.Plan.Name : null,
            Items = o.Items.Select(i => new
            {
                i.ProductId,
                ProductName = i.Product.Name,
                ProductThumbnail = !string.IsNullOrEmpty(i.Product.ThumbnailUrl)
                    ? _storage.GenerateReadSasUrl(i.Product.ThumbnailUrl, TimeSpan.FromHours(24))
                    : null,
                i.UnitPrice
            })
        }).ToList();

        return Ok(new
        {
            items = result,
            page,
            pageSize,
            totalItems = total,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }
}
