using Microsoft.Extensions.Logging;
using OCFigureHub.Application.Abstractions.AI;
using OCFigureHub.Application.DTOs.Chat;

namespace OCFigureHub.Infrastructure.AI;

public class RuleBasedChatProvider : IAiChatProvider
{
    private readonly ILogger _logger;

    public string Name => "RuleBased";

    public RuleBasedChatProvider(ILogger<RuleBasedChatProvider> logger)
    {
        _logger = logger;
    }

    public Task<AiChatProviderResult> GenerateAsync(AiChatProviderRequest request, CancellationToken ct)
    {
        _logger.LogInformation("[RuleBased] Generating rule-based response");

        var message = request.CurrentMessage.ToLowerInvariant();
        var reply = GenerateResponse(message, request);

        return Task.FromResult(new AiChatProviderResult
        {
            Success = true,
            Reply = reply,
            Provider = Name
        });
    }

    private string GenerateResponse(string message, AiChatProviderRequest request)
    {
        if (ContainsAny(message, "membership", "gói", "subscription", "pro", "vip", "trả phí", "nâng cấp"))
        {
            return @"OC Figure Hub có các gói membership:

**Miễn phí (Free):**
- Tải một số model miễn phí
- Giới hạn số lượt tải/tháng

**Gói Pro:**
- Tải tất cả model (kể cả miễn phí và trả phí)
- Không giới hạn lượt tải
- Ưu tiên hỗ trợ

**Gói Commercial:**
- Tất cả quyền lợi của Pro
- Quyền sử dụng thương mại cho sản phẩm

Bạn có thể xem chi tiết và đăng ký tại: /upgrade";
        }

        if (ContainsAny(message, "tải", "download", "stl", "glb", "gltf", "obj", "file", "lấy file"))
        {
            return @"Để tải file model 3D:

1. **Đăng nhập** tài khoản của bạn
2. **Mua** model (nếu cần) hoặc có gói membership phù hợp
3. Vào **trang sản phẩm** → nhấn nút **Tải xuống**

Nếu bạn chưa mua hoặc không có membership phù hợp, bạn sẽ thấy thông báo yêu cầu mua hàng trước.

Liên hệ admin nếu gặp vấn đề về tải file.";
        }

        if (ContainsAny(message, "license", "giấy phép", "commercial", "cmercial", "thương mại", "bản quyền"))
        {
            return @"OC Figure Hub có các loại license:

**Personal/Non-Commercial:**
- Chỉ sử dụng cho mục đích cá nhân
- Không được phép bán sản phẩm tạo ra

**Commercial:**
- Được phép sử dụng cho mục đích thương mại
- Có thể bán sản phẩm in 3D từ model

Mỗi sản phẩm sẽ có license được ghi rõ trên trang sản phẩm. Nếu bạn cần license thương mại, hãy chọn model có license Commercial hoặc nâng cấp gói Commercial membership.";
        }

        if (ContainsAny(message, "model", "3d", "file", "tìm", "tìm kiếm", "anime", "character", "nhân vật"))
        {
            var productContext = request.ProductContext?.Products;
            if (productContext != null && productContext.Count > 0)
            {
                var topProducts = productContext.Take(3).ToList();
                var productList = string.Join("\n", topProducts.Select(p =>
                    $"- **{p.Name}** (ID: {p.Id})\n  Giá: {(p.Price == 0 ? "Miễn phí" : p.Price + "đ")} | License: {p.License}"));

                return $"Dựa trên yêu cầu của bạn, đây là một số gợi ý:\n\n{productList}\n\nXem thêm tại: /";
            }

            return @"OC Figure Hub có nhiều model 3D đa dạng về chủ đề:

- Anime/Nhân vật
- Game character
- Animals/Fantasy
- Architecture
- Và nhiều hơn nữa...

Bạn có thể tìm kiếm model theo:
- Từ khóa (tên, chủ đề)
- Danh mục (Category)
- Giá (miễn phí hoặc trả phí)
- License (cá nhân/thương mại)
- Format file (STL, GLB, OBJ...)

Thử tìm kiếm tại trang chủ: /";
        }

        if (ContainsAny(message, "giá", "tiền", "bao nhiêu", "mua", "mất phí", "free", "miễn phí", "trả phí"))
        {
            return @"OC Figure Hub có model miễn phí và trả phí:

**Model miễn phí:**
- Một số model được cung cấp miễn phí cho tất cả người dùng
- Không cần mua nhưng có thể cần đăng nhập để tải

**Model trả phí:**
- Giá từ vài chục nghìn đến hàng triệu đồng tùy model
- Thanh toán một lần, sử dụng vĩnh viễn (tùy license)

Bạn có thể xem giá cụ thể trên trang sản phẩm hoặc tìm model miễn phí tại: /";
        }

        if (ContainsAny(message, "đăng nhập", "đăng ký", "tạo tài khoản", "sign in", "sign up", "register", "login"))
        {
            return @"Để đăng nhập hoặc đăng ký tài khoản OC Figure Hub:

1. Nhấn **Đăng nhập** ở góc trên bên phải
2. Nhập email và mật khẩu để đăng nhập
3. Hoặc nhấn **Đăng ký** để tạo tài khoản mới

Sau khi đăng nhập, bạn có thể:
- Mua model
- Tải model đã mua
- Xem lịch sử tải xuống
- Đăng ký membership";
        }

        if (ContainsAny(message, "admin", "hỗ trợ", "liên hệ", "support", "help", "contact"))
        {
            return @"Nếu bạn cần hỗ trợ từ admin:

- Gửi email qua trang Liên hệ
- Hoặc inbox trực tiếp cho fanpage

Thời gian phản hồi thường trong vòng 24 giờ làm việc.";
        }

        return @"Xin chào! 👋

OC Assistant đang gặp sự cố kết nối AI. Bạn có thể:

1. **Thử lại sau** - Hệ thống AI có thể đang quá tải
2. **Tìm sản phẩm** ngay tại trang chủ: /
3. **Xem gói membership** tại: /upgrade
4. **Liên hệ admin** nếu cần hỗ trợ

Cảm ơn bạn đã kiên nhẫn! 🙏";
    }

    private static bool ContainsAny(string text, params string[] keywords)
    {
        return keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
    }
}
