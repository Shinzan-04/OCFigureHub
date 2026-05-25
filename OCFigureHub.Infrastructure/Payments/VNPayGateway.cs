using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OCFigureHub.Application.Abstractions.Payments;
using System.Security.Cryptography;
using System.Text;

namespace OCFigureHub.Infrastructure.Payments;

public class VNPayGateway : IPaymentGateway
{
    private readonly VNPayOptions _opt;
    private readonly ILogger<VNPayGateway> _logger;

    public VNPayGateway(IOptions<VNPayOptions> opt, ILogger<VNPayGateway> logger)
    {
        _opt = opt.Value;
        _logger = logger;
    }

    public Task<PayOSPaymentResult> CreatePaymentUrlAsync(Guid orderId, decimal amount, string ipAddress, CancellationToken ct)
        => throw new NotSupportedException("VNPayGateway is deprecated; PayOSGateway is active.");

    public bool VerifySignature(IDictionary<string, string> vnpParams)
    {
        var filtered = new SortedDictionary<string, string>(
            vnpParams
                .Where(kv => kv.Key.StartsWith("vnp_"))
                .Where(kv => kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType")
                .ToDictionary(x => x.Key, x => x.Value)
        );

        StringBuilder data = new StringBuilder();

        foreach (var kv in filtered)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(System.Net.WebUtility.UrlEncode(kv.Key))
                    .Append("=")
                    .Append(System.Net.WebUtility.UrlEncode(kv.Value))
                    .Append("&");
            }
        }

        string hashData = data.ToString().TrimEnd('&');

        _logger.LogInformation("VNPAY Return HashData: {HashData}", hashData);

        string expected = HmacSha512(_opt.HashSecret, hashData);

        if (!vnpParams.TryGetValue("vnp_SecureHash", out var actual))
            return false;

        _logger.LogInformation("VNPAY ExpectedHash: {Expected}", expected);
        _logger.LogInformation("VNPAY ActualHash: {Actual}", actual);

        return string.Equals(expected, actual, StringComparison.OrdinalIgnoreCase);
    }

    private static string HmacSha512(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToUpper();
    }

    // Interface stub — not used since PayOSGateway replaced VNPayGateway in DI
    public bool VerifyWebhookSignature(string body, string? signatureFromHeader) => true;
}