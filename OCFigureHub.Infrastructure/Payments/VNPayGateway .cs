using Microsoft.Extensions.Options;
using OCFigureHub.Application.Abstractions.Payments;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace OCFigureHub.Infrastructure.Payments;

public class VNPayGateway : IPaymentGateway
{
    private readonly VNPayOptions _opt;

    public VNPayGateway(IOptions<VNPayOptions> opt)
    {
        _opt = opt.Value;
    }

    public Task<string> CreatePaymentUrlAsync(Guid orderId, decimal amount, CancellationToken ct)
    {
        // VNPay amount unit = VND * 100
        var vnpAmount = ((long)(amount * 100)).ToString();

        var now = DateTime.UtcNow;
        var txnRef = orderId.ToString("N"); // map orderId -> txnRef

        var vnpParams = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _opt.TmnCode,
            ["vnp_Amount"] = vnpAmount,
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = txnRef,
            ["vnp_OrderInfo"] = $"Pay order {orderId}",
            ["vnp_OrderType"] = "other",
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _opt.ReturnUrl,
            ["vnp_IpAddr"] = "127.0.0.1",
            ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss")
        };

        var signData = BuildQueryString(vnpParams, urlEncode: false);
        var secureHash = HmacSha512(_opt.HashSecret, signData);

        vnpParams["vnp_SecureHash"] = secureHash;

        var query = BuildQueryString(vnpParams, urlEncode: true);
        var url = $"{_opt.BaseUrl}?{query}";

        return Task.FromResult(url);
    }

    public bool VerifySignature(IDictionary<string, string> vnpParams)
    {
        // remove hash fields
        var filtered = new SortedDictionary<string, string>(
            vnpParams
                .Where(kv => kv.Key.StartsWith("vnp_"))
                .Where(kv => kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType")
                .ToDictionary(x => x.Key, x => x.Value)
        );

        var signData = BuildQueryString(filtered, urlEncode: false);

        var expected = HmacSha512(_opt.HashSecret, signData);

        if (!vnpParams.TryGetValue("vnp_SecureHash", out var actual))
            return false;

        return string.Equals(expected, actual, StringComparison.OrdinalIgnoreCase);
    }

    private static string BuildQueryString(SortedDictionary<string, string> dict, bool urlEncode)
    {
        var sb = new StringBuilder();
        foreach (var kv in dict)
        {
            if (string.IsNullOrWhiteSpace(kv.Value)) continue;

            if (sb.Length > 0) sb.Append('&');

            var key = kv.Key;
            var val = urlEncode ? HttpUtility.UrlEncode(kv.Value) : kv.Value;

            sb.Append(key).Append('=').Append(val);
        }
        return sb.ToString();
    }

    private static string HmacSha512(string key, string data)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToLower();
    }
}
