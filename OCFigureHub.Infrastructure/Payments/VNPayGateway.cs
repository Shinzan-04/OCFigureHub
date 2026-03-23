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

    public Task<string> CreatePaymentUrlAsync(Guid orderId, decimal amount, string ipAddress, CancellationToken ct)
    {
        var vnpAmount = ((long)(amount * 100)).ToString();
        var now = DateTime.UtcNow.AddHours(7); // ✅ FIX timezone
        var txnRef = orderId.ToString("N");

        var vnpParams = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _opt.TmnCode,
            ["vnp_Amount"] = vnpAmount,
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = txnRef,
            ["vnp_OrderInfo"] = $"Thanh_toan_don_hang_{txnRef}", // ✅ tránh space
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _opt.ReturnUrl,
            ["vnp_IpAddr"] = !string.IsNullOrEmpty(ipAddress) && ipAddress != "::1" ? ipAddress : "127.0.0.1",
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss"),
            ["vnp_ExpireDate"] = now.AddMinutes(15).ToString("yyyyMMddHHmmss")
        };

        StringBuilder data = new StringBuilder();

        foreach (var kv in vnpParams)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(System.Net.WebUtility.UrlEncode(kv.Key))
                    .Append("=")
                    .Append(System.Net.WebUtility.UrlEncode(kv.Value))
                    .Append("&");
            }
        }

        string signData = data.ToString().TrimEnd('&');
        string queryString = data.ToString(); // includes trailing &

        _logger.LogInformation("VNPAY HashData: {HashData}", signData);

        string vnp_SecureHash = HmacSha512(_opt.HashSecret, signData);

        _logger.LogInformation("VNPAY SecureHash: {Hash}", vnp_SecureHash);

        string paymentUrl = _opt.BaseUrl + "?" + queryString + "vnp_SecureHash=" + vnp_SecureHash;

        return Task.FromResult(paymentUrl);
    }

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
}