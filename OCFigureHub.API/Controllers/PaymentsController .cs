using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions.Payments;
using OCFigureHub.Application.DTOs.Payments;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/payments/vnpay")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentGateway _vnpay;
    private readonly OrderService _orders;

    public PaymentsController(IPaymentGateway vnpay, OrderService orders)
    {
        _vnpay = vnpay;
        _orders = orders;
    }

    // Return URL (user browser redirect)
    [HttpGet("return")]
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

        // VNPay response code: "00" = success
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

        // txnRef = orderId (N format)
        if (!Guid.TryParseExact(txnRef, "N", out var orderId))
        {
            return BadRequest(new VNPayCallbackResultDto
            {
                Success = false,
                Message = "Invalid order reference"
            });
        }

        await _orders.MarkPaidAsync(orderId, transNo ?? "VNPay", ct);

        return Ok(new VNPayCallbackResultDto
        {
            Success = true,
            OrderId = orderId,
            PaymentRef = transNo,
            Message = "Order marked as PAID"
        });
    }

    // IPN (server-to-server)
    [HttpGet("ipn")]
    public async Task<IActionResult> IPN(CancellationToken ct)
    {
        var dict = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());

        if (!_vnpay.VerifySignature(dict))
        {
            // VNPay expects specific response format
            return Ok(new { RspCode = "97", Message = "Invalid signature" });
        }

        dict.TryGetValue("vnp_ResponseCode", out var code);
        dict.TryGetValue("vnp_TxnRef", out var txnRef);
        dict.TryGetValue("vnp_TransactionNo", out var transNo);

        if (code != "00")
            return Ok(new { RspCode = "00", Message = "Payment not success but received" });

        if (!Guid.TryParseExact(txnRef, "N", out var orderId))
            return Ok(new { RspCode = "01", Message = "Order not found" });

        await _orders.MarkPaidAsync(orderId, transNo ?? "VNPay", ct);

        return Ok(new { RspCode = "00", Message = "Confirm Success" });
    }
}
