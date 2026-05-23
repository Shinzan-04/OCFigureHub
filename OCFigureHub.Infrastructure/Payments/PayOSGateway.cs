using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OCFigureHub.Application.Abstractions.Payments;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace OCFigureHub.Infrastructure.Payments;

public class PayOSGateway : IPaymentGateway
{
    private readonly PayOSOptions _opt;
    private readonly ILogger<PayOSGateway> _logger;
    private readonly HttpClient _httpClient;

    public PayOSGateway(IOptions<PayOSOptions> opt, ILogger<PayOSGateway> logger, HttpClient httpClient)
    {
        _opt = opt.Value;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<PayOSPaymentResult> CreatePaymentUrlAsync(Guid orderId, decimal amount, string ipAddress, CancellationToken ct)
    {
        var amountInt = (int)amount; // PayOS expects integer VND
        var now = DateTime.UtcNow.AddHours(7);

        // PayOS orderCode must be a positive integer, unique per day
        // Format: YYMMDD + random 4 digits to avoid collision
        var dateStr = now.ToString("yyMMdd");
        var random = Random.Shared.Next(1000, 9999);
        var orderCode = long.Parse($"{dateStr}{random}");

        var description = "OCFIGURE";
        var returnUrl = _opt.ReturnUrl;
        var cancelUrl = _opt.CancelUrl;

        // Build signature: amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl
        var signData = $"amount={amountInt}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}";
        var signature = ComputeHmacSha256(_opt.ChecksumKey, signData);

        _logger.LogInformation("PayOS SignData: {SignData}", signData);
        _logger.LogInformation("PayOS Signature: {Signature}", signature);

        var requestBody = new
        {
            orderCode,
            amount = amountInt,
            description,
            returnUrl,
            cancelUrl,
            signature
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var request = new HttpRequestMessage(HttpMethod.Post, $"{_opt.BaseUrl}/v2/payment-requests")
        {
            Headers =
            {
                { "x-client-id", _opt.ClientId },
                { "x-api-key", _opt.ApiKey }
            },
            Content = content
        };

        var response = await _httpClient.SendAsync(request, ct);
        var responseBody = await response.Content.ReadAsStringAsync(ct);

        _logger.LogInformation("PayOS API Response: {StatusCode} {Body}", response.StatusCode, responseBody);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"PayOS API error: {response.StatusCode} - {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;

        if (root.TryGetProperty("code", out var code) && code.GetString() != "00")
        {
            var message = root.TryGetProperty("message", out var msg) ? msg.GetString() : "Unknown error";
            throw new Exception($"PayOS create payment failed: {code} - {message}");
        }

        var data = root.GetProperty("data");
        var checkoutUrl = data.GetProperty("checkoutUrl").GetString();

        if (string.IsNullOrEmpty(checkoutUrl))
        {
            throw new Exception("PayOS did not return a checkoutUrl");
        }

        _logger.LogInformation("PayOS checkoutUrl created for order {OrderId}: {Url}, orderCode: {OrderCode}", orderId, checkoutUrl, orderCode);

        return new PayOSPaymentResult(checkoutUrl, orderCode.ToString());
    }

    public bool VerifySignature(IDictionary<string, string> vnpParams)
    {
        // Kept for backward compat with VNPay endpoints — unused for PayOS
        // PayOS signature verification is done in controllers via VerifyWebhookSignature
        return true;
    }

    public bool VerifyWebhookSignature(string body, string? signatureFromHeader)
    {
        if (string.IsNullOrEmpty(signatureFromHeader))
        {
            _logger.LogWarning("PayOS webhook: missing signature header");
            return false;
        }

        var expected = ComputeHmacSha256(_opt.ChecksumKey, body);

        var result = string.Equals(expected, signatureFromHeader, StringComparison.OrdinalIgnoreCase);
        if (!result)
        {
            _logger.LogWarning("PayOS webhook signature mismatch. Expected: {Expected}, Got: {Actual}", expected, signatureFromHeader);
        }

        return result;
    }

    private static string ComputeHmacSha256(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToLower();
    }
}
