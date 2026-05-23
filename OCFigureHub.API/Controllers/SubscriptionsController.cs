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
    private readonly IPaymentGateway _payos;
    private readonly IPaymentTransactionRepository _transactions;
    private readonly IOrderRepository _orders;
    private readonly ILogger<SubscriptionsController> _logger;

    public SubscriptionsController(
        ISubscriptionPlanRepository plans,
        SubscriptionService svc,
        IPaymentGateway payos,
        IPaymentTransactionRepository transactions,
        IOrderRepository orders,
        ILogger<SubscriptionsController> logger)
    {
        _plans = plans;
        _svc = svc;
        _payos = payos;
        _transactions = transactions;
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

    /// <summary>
    /// Create PayOS payment for a subscription plan (alias: vnpay-create for backward compat)
    /// </summary>
    [HttpPost("payos-create")]
    public async Task<IActionResult> CreatePayOS([FromBody] CreateSubPaymentRequest req, CancellationToken ct)
    {
        try
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = Guid.Parse(userIdString);
            var plan = await _plans.GetEnabledByIdAsync(req.PlanId, ct)
                       ?? throw new Exception($"Plan with ID {req.PlanId} not found or disabled.");

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
            var result = await _payos.CreatePaymentUrlAsync(order.Id, order.TotalAmount, ip, ct);

            var txn = new PaymentTransaction
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Provider = "PAYOS",
                ProviderTxnId = result.OrderCode,
                Status = PaymentStatus.Pending,
                Amount = order.TotalAmount,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _transactions.AddAsync(txn, ct);
            await _transactions.SaveChangesAsync(ct);

            return Ok(new { paymentUrl = result.CheckoutUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating PayOS subscription URL for Plan {PlanId}", req.PlanId);
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Backward compat alias
    [HttpPost("vnpay-create")]
    public Task<IActionResult> CreateVnpayAlias([FromBody] CreateSubPaymentRequest req, CancellationToken ct)
        => CreatePayOS(req, ct);
}

public class CreateSubPaymentRequest { public Guid PlanId { get; set; } }
