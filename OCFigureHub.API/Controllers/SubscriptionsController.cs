using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.DTOs.Subscriptions;
using OCFigureHub.Application.Services;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using System.Security.Claims;

namespace OCFigureHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionPlanRepository _plans;
    private readonly SubscriptionService _svc;
    private readonly IPaymentGateway _vnpay;
    private readonly IOrderRepository _orders;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(
        ISubscriptionPlanRepository plans,
        SubscriptionService svc,
        IPaymentGateway vnpay,
        IOrderRepository orders,
        ILogger<SubscriptionsController> logger)
    {
        _plans = plans;
        _svc = svc;
        _vnpay = vnpay;
        _orders = orders;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var list = await _plans.GetAllAsync(ct);
        return Ok(list.Where(x => x.IsEnabled));
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        
        var userId = Guid.Parse(userIdString);
        var sub = await _svc.GetCurrentAsync(userId, ct);
        return Ok(sub);
    }

    [HttpPost("vnpay-create")]
    public async Task<IActionResult> CreateVnpaySubscription([FromBody] CreateSubPaymentRequest req, CancellationToken ct)
    {
        try 
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            
            var userId = Guid.Parse(userIdString);
            var plan = await _plans.GetEnabledByIdAsync(req.PlanId, ct)
                       ?? throw new Exception($"Plan with ID {req.PlanId} not found or disabled.");

            // Create a Special "Subscription Order"
            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanId = req.PlanId,
                TotalAmount = plan.MonthlyPrice,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _orders.AddOrderAsync(order, ct);
            await _orders.SaveChangesAsync(ct);

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var paymentUrl = await _vnpay.CreatePaymentUrlAsync(order.Id, order.TotalAmount, ip, ct);

            return Ok(new { paymentUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating VNPay subscription URL for Plan {PlanId}", req.PlanId);
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

public class CreateSubPaymentRequest { public Guid PlanId { get; set; } }
