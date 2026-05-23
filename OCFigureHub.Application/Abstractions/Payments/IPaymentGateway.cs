using System.Collections.Generic;

namespace OCFigureHub.Application.Abstractions.Payments;

public record PayOSPaymentResult(string CheckoutUrl, string OrderCode);

public interface IPaymentGateway
{
    Task<PayOSPaymentResult> CreatePaymentUrlAsync(Guid orderId, decimal amount, string ipAddress, CancellationToken ct);

    // For Return URL and IPN verification (VNPay-style, kept for compat)
    bool VerifySignature(IDictionary<string, string> vnpParams);

    // For PayOS webhook signature verification
    bool VerifyWebhookSignature(string body, string? signatureFromHeader);
}
