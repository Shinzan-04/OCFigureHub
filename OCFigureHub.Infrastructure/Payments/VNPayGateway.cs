using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OCFigureHub.Application.Abstractions.Payments;
using System.Security.Cryptography;
using System.Text;
using System.Net;

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
        var now = DateTime.Now;
        var txnRef = orderId.ToString("N");

        var vnpParams = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _opt.TmnCode,
            ["vnp_Amount"] = vnpAmount,
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = txnRef,
            ["vnp_OrderInfo"] = "Thanh toan don hang " + txnRef,
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _opt.ReturnUrl,
            ["vnp_IpAddr"] = !string.IsNullOrEmpty(ipAddress) && ipAddress != "::1" ? ipAddress : "127.0.0.1",
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss")
        };

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        foreach (var kv in vnpParams)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                // ❌ KHÔNG encode khi hash
                hashData.Append(kv.Key).Append("=").Append(kv.Value).Append("&");

                // ✅ encode khi build URL
                query.Append(WebUtility.UrlEncode(kv.Key))
                     .Append("=")
                     .Append(WebUtility.UrlEncode(kv.Value))
                     .Append("&");
            }
        }

        string hashString = hashData.ToString().TrimEnd('&');
        string queryString = query.ToString().TrimEnd('&');

        _logger.LogInformation("VNPAY HashData: {HashData}", hashString);
        string vnp_SecureHash = HmacSha512(_opt.HashSecret, hashString);

        string paymentUrl = _opt.BaseUrl + "?" + queryString + "&vnp_SecureHash=" + vnp_SecureHash;

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
                // ❌ KHÔNG encode ở đây
                data.Append(kv.Key).Append("=").Append(kv.Value).Append("&");
            }
        }

        string result = data.ToString().TrimEnd('&');
        _logger.LogInformation("VNPAY Return HashData: {HashData}", result);
        string expected = HmacSha512(_opt.HashSecret, result);

        if (!vnpParams.TryGetValue("vnp_SecureHash", out var actual))
            return false;

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
