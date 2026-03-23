using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.DTOs.Payments;
using OCFigureHub.Application.Services;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGateway _vnpay;
    private readonly OrderService _orders;
    private readonly SubscriptionService _subs;

    public PaymentsController(IPaymentGateway vnpay, OrderService orders, SubscriptionService subs)
    {
        _vnpay = vnpay;
        _orders = orders;
        _subs = subs;
    }

    /// <summary>
    /// Create a VNPay payment URL (redirect user to VNPay)
    /// </summary>
    [HttpPost("vnpay-create")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePaymentRequestDto req,
        CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var url = await _vnpay.CreatePaymentUrlAsync(req.OrderId, req.Amount, ip, ct);
        return Ok(new CreatePaymentResponseDto
        {
            OrderId = req.OrderId,
            PaymentUrl = url
        });
    }

    // Return URL (user browser redirect)
    [HttpGet("vnpay-return")]
    public async Task<IActionResult> Return(CancellationToken ct)
    {
        var dict = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());

        if (!_vnpay.VerifySignature(dict))
        {
            return BadRequest(new VNPayCallbackResultDto
            {
                Success = false,
                Message = "Invalid signature"
            });
        }

        dict.TryGetValue("vnp_ResponseCode", out var code);
        dict.TryGetValue("vnp_TxnRef", out var txnRef);
        dict.TryGetValue("vnp_TransactionNo", out var transNo);

        if (code != "00")
        {
            return Ok(new VNPayCallbackResultDto
            {
                Success = false,
                Message = $"Payment failed: {code}"
            });
        }

        if (!Guid.TryParseExact(txnRef, "N", out var orderId))
        {
            return BadRequest(new VNPayCallbackResultDto
            {
                Success = false,
                Message = "Invalid order reference"
            });
        }

        var order = await _orders.MarkPaidAsync(orderId, transNo ?? "VNPay", ct);

        // ACTIVATE SUBSCRIPTION IF ORDER HAS PLAN
        if (order.PlanId.HasValue)
        {
            await _subs.ActivateSubscriptionAsync(order.UserId, order.PlanId.Value, ct);
        }

        return Ok(new VNPayCallbackResultDto
        {
            Success = true,
            OrderId = orderId,
            PaymentRef = transNo,
            Message = order.PlanId.HasValue ? "Subscription ACTIVATED" : "Order marked as PAID"
        });
    }

    // IPN (server-to-server)
    [HttpGet("vnpay-ipn")]
    public async Task<IActionResult> IPN(CancellationToken ct)
    {
        var dict = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());

        if (!_vnpay.VerifySignature(dict))
        {
            return Ok(new { RspCode = "97", Message = "Invalid signature" });
        }

        dict.TryGetValue("vnp_ResponseCode", out var code);
        dict.TryGetValue("vnp_TxnRef", out var txnRef);
        dict.TryGetValue("vnp_TransactionNo", out var transNo);

        if (code != "00")
            return Ok(new { RspCode = "00", Message = "Payment not success but received" });

        if (!Guid.TryParseExact(txnRef, "N", out var orderId))
            return Ok(new { RspCode = "01", Message = "Order not found" });

        var order = await _orders.MarkPaidAsync(orderId, transNo ?? "VNPay", ct);

        if (order.PlanId.HasValue)
        {
            await _subs.ActivateSubscriptionAsync(order.UserId, order.PlanId.Value, ct);
        }

        return Ok(new { RspCode = "00", Message = "Confirm Success" });
    }
}
