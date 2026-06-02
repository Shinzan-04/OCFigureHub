using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.DTOs.Payments;
using OCFigureHub.Application.Services;
using OCFigureHub.API.Services;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using System.Text.Json;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGateway _payos;
    private readonly OrderService _orders;
    private readonly SubscriptionService _subs;
    private readonly IPaymentTransactionRepository _transactions;
    private readonly NotificationService _notif;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        IPaymentGateway payos,
        OrderService orders,
        SubscriptionService subs,
        IPaymentTransactionRepository transactions,
        NotificationService notif,
        ILogger<PaymentsController> logger)
    {
        _payos = payos;
        _orders = orders;
        _subs = subs;
        _transactions = transactions;
        _notif = notif;
        _logger = logger;
    }

    /// <summary>
    /// Create a PayOS payment URL (alias: vnpay-create for backward compat)
    /// </summary>
    [HttpPost("payos-create")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePaymentRequestDto req,
        CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var result = await _payos.CreatePaymentUrlAsync(req.OrderId, req.Amount, ip, ct);

        // Save PaymentTransaction using the EXACT orderCode that PayOS received
        var txn = new Domain.Entities.PaymentTransaction
        {
            Id = Guid.NewGuid(),
            OrderId = req.OrderId,
            Provider = "PAYOS",
            ProviderTxnId = result.OrderCode,
            Status = PaymentStatus.Pending,
            Amount = req.Amount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _transactions.AddAsync(txn, ct);
        await _transactions.SaveChangesAsync(ct);

        return Ok(new CreatePaymentResponseDto
        {
            OrderId = req.OrderId,
            PaymentUrl = result.CheckoutUrl
        });
    }

    // Backward compat alias
    [HttpPost("vnpay-create")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Customer,Admin")]
    public Task<IActionResult> CreateVnpayAlias([FromBody] CreatePaymentRequestDto req, CancellationToken ct)
        => Create(req, ct);

    // User browser redirect back from PayOS
    [HttpGet("payos-return")]
    public async Task<IActionResult> Return(CancellationToken ct)
    {
        var status = Request.Query["status"].ToString();
        var orderCodeStr = Request.Query["orderCode"].ToString();

        if (string.IsNullOrEmpty(orderCodeStr) || !long.TryParse(orderCodeStr, out var orderCode))
        {
            return Ok(new PaymentCallbackResultDto
            {
                Success = false,
                Message = "Invalid or missing orderCode"
            });
        }

        if (status != "PAID")
        {
            return Ok(new PaymentCallbackResultDto
            {
                Success = false,
                Message = $"Payment not completed: {status}"
            });
        }

        // Find transaction by PayOS orderCode
        var txn = await _transactions.GetByProviderTxnIdAsync(orderCode.ToString(), ct);
        if (txn == null)
        {
            _logger.LogWarning("PayOS return: no transaction found for orderCode {OrderCode}", orderCode);
            return Ok(new PaymentCallbackResultDto
            {
                Success = false,
                Message = "Transaction not found"
            });
        }

        var order = await _orders.MarkPaidAsync(txn.OrderId, $"PayOS:{orderCode}", ct);

        txn.Status = PaymentStatus.Paid;
        await _transactions.UpdateAsync(txn, ct);
        await _transactions.SaveChangesAsync(ct);

        if (order.PlanId.HasValue)
        {
            await _subs.ActivateSubscriptionAsync(order.UserId, order.PlanId.Value, ct);
            try { await _notif.NotifySubscription(order.UserId, order.Plan?.Name ?? "Premium", ct); } catch { }
        }
        else
        {
            try { await _notif.NotifyPaymentSuccess(order.UserId, order.TotalAmount, ct); } catch { }
        }

        return Ok(new PaymentCallbackResultDto
        {
            Success = true,
            OrderId = txn.OrderId,
            PaymentRef = $"PayOS:{orderCode}",
            Message = order.PlanId.HasValue ? "Subscription ACTIVATED" : "Order marked as PAID"
        });
    }

    // Backward compat alias
    [HttpGet("vnpay-return")]
    public Task<IActionResult> ReturnVnpayAlias(CancellationToken ct)
        => Return(ct);

    // Server-to-server webhook from PayOS
    [HttpPost("payos-webhook")]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(ct);

        var signature = Request.Headers["x-signature"].FirstOrDefault();
        if (!_payos.VerifyWebhookSignature(body, signature))
        {
            _logger.LogWarning("PayOS webhook: invalid signature");
            return Ok(new { code = "97", message = "Invalid signature" });
        }

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        var status = root.GetProperty("status").GetString();
        var data = root.GetProperty("data");
        var orderCodeStr = data.GetProperty("orderCode").GetString() ?? "";

        if (status != "PAID")
        {
            _logger.LogInformation("PayOS webhook: received status {Status}, skipping", status);
            return Ok(new { code = "00", message = "Received" });
        }

        var txn = await _transactions.GetByProviderTxnIdAsync(orderCodeStr, ct);
        if (txn == null)
        {
            _logger.LogWarning("PayOS webhook: no transaction for orderCode {OrderCode}", orderCodeStr);
            return Ok(new { code = "01", message = "Transaction not found" });
        }

        var order = await _orders.MarkPaidAsync(txn.OrderId, $"PayOS:{orderCodeStr}", ct);

        txn.Status = PaymentStatus.Paid;
        await _transactions.UpdateAsync(txn, ct);
        await _transactions.SaveChangesAsync(ct);

        if (order.PlanId.HasValue)
        {
            await _subs.ActivateSubscriptionAsync(order.UserId, order.PlanId.Value, ct);
        }

        _logger.LogInformation("PayOS webhook: order {OrderId} marked as PAID via webhook", order.Id);
        return Ok(new { code = "00", message = "Confirm Success" });
    }
}
