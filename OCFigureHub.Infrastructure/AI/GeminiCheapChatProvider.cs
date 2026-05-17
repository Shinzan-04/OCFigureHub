using Microsoft.Extensions.Logging;
using OCFigureHub.Application.DTOs.Chat;

namespace OCFigureHub.Infrastructure.AI;

public class GeminiCheapChatProvider : BaseGeminiChatProvider
{
    private const string SystemPrompt = @"Bạn là ""OC Assistant"", trợ lý AI chuyên nghiệp của OC Figure Hub.
NHIỆM VỤ: Giúp người dùng tìm file model 3D, giải đáp về membership, license, format, mua hàng và tải xuống tại website OC Figure Hub.

QUY TẮC BẮT BUỘC:
1. LUÔN trả lời bằng tiếng Việt.
2. CHỈ trả lời các câu hỏi liên quan đến OC Figure Hub, in 3D, mô hình 3D, hoặc hỗ trợ mua hàng.
3. TỪ CHỐI LỊCH SỰ các câu hỏi không liên quan (ví dụ: nấu ăn, toán học, tin tức thế giới, code lập trình không liên quan shop...). 
   Câu trả lời mẫu: ""Xin lỗi, tôi là trợ lý chuyên biệt của OC Figure Hub, tôi chỉ có thể hỗ trợ các vấn đề liên quan đến mô hình 3D và dịch vụ của shop.""
4. CHỈ dùng thông tin sản phẩm trong phần [CONTEXT] để tư vấn sản phẩm thực tế. Nếu không có sản phẩm phù hợp trong context, hãy nói shop hiện chưa có mẫu đó.
5. KHÔNG bịa đặt thông tin (giá, ID, URL). Gợi ý link sản phẩm dạng: /product/{id}.
6. Trả lời ngắn gọn, tập trung vào giải pháp.
7. Tuyệt đối không hỏi hoặc lưu trữ thông tin nhạy cảm của người dùng.";

    public override string Name => "GeminiCheap";

    public GeminiCheapChatProvider(
        HttpClient httpClient,
        ILogger<GeminiCheapChatProvider> logger,
        string apiKey)
        : base(httpClient, logger, apiKey, "gemini-2.5-flash")
    {
    }

    protected override string GetSystemPrompt(AiChatProviderRequest request)
    {
        return SystemPrompt;
    }

    protected override List<object> BuildContents(AiChatProviderRequest request)
    {
        var contents = new List<object>();

        if (request.ProductContext?.Products.Count > 0)
        {
            var productList = string.Join("\n", request.ProductContext.Products.Select(p =>
                $"- ID: {p.Id}, Tên: {p.Name}, Danh mục: {p.Category}, Giá: {(p.Price == 0 ? "Miễn phí" : p.Price + "đ")}, Creator: {p.Creator}, License: {p.License}, Tags: {p.Tags}"));
            
            contents.Add(new { role = "user", parts = new[] { new { text = $"[CONTEXT] Đây là các sản phẩm liên quan trong shop OC Figure Hub:\n{productList}\nHãy ghi nhớ thông tin này để tư vấn nếu người dùng hỏi." } } });
            contents.Add(new { role = "model", parts = new[] { new { text = "Tôi đã ghi nhớ thông tin sản phẩm. Tôi sẽ chỉ tư vấn dựa trên danh sách này." } } });
        }

        foreach (var msg in request.History)
        {
            contents.Add(new { role = msg.Role == "assistant" ? "model" : "user", parts = new[] { new { text = msg.Content } } });
        }

        contents.Add(new { role = "user", parts = new[] { new { text = request.CurrentMessage } } });

        return contents;
    }
}
