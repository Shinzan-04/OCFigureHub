using Microsoft.Extensions.Logging;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.Abstractions.AI;
using OCFigureHub.Application.DTOs.Chat;
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Services;

public class AiChatRouterService
{
    private readonly IChatRepository _chatRepo;
    private readonly IProductRepository _productRepo;
    private readonly IEnumerable<IAiChatProvider> _providers;
    private readonly ILogger<AiChatRouterService> _logger;

    private const int MaxHistoryMessages = 8;
    private const int MaxProductsInContext = 5;
    private const int MaxInputChars = 1000;
    private const int GuestDailyLimit = 20;
    private const int UserDailyLimit = 30;

    private readonly IChatRateLimiter _rateLimiter;

    public AiChatRouterService(
        IChatRepository chatRepo,
        IProductRepository productRepo,
        IEnumerable<IAiChatProvider> providers,
        IChatRateLimiter rateLimiter,
        ILogger<AiChatRouterService> logger)
    {
        _chatRepo = chatRepo;
        _productRepo = productRepo;
        _providers = providers;
        _rateLimiter = rateLimiter;
        _logger = logger;
    }

    public async Task<ChatMessageResponse> ProcessMessageAsync(
        ChatMessageRequest request,
        Guid? userId,
        string? guestKey,
        CancellationToken ct)
    {
        var message = request.Message.Trim();

        if (message.Length > MaxInputChars)
        {
            throw new ArgumentException($"Tin nhắn không được vượt quá {MaxInputChars} ký tự.");
        }

        var rateLimitKey = userId.HasValue ? $"user:{userId}" : $"guest:{guestKey}";
        var dailyLimit = userId.HasValue ? UserDailyLimit : GuestDailyLimit;

        if (!_rateLimiter.IsAllowed(rateLimitKey, dailyLimit))
        {
            var remaining = _rateLimiter.GetRemaining(rateLimitKey, dailyLimit);
            return new ChatMessageResponse
            {
                SessionId = request.SessionId ?? Guid.Empty,
                Reply = $"Bạn đã hết lượt chat hôm nay. Giới hạn: {dailyLimit} tin nhắn/ngày. Vui lòng thử lại vào ngày mai hoặc nâng cấp gói membership để tăng giới hạn.",
                Provider = "RateLimit",
                FallbackUsed = false,
                CreatedAtUtc = DateTime.UtcNow
            };
        }

        var session = await GetOrCreateSessionAsync(request.SessionId, userId, guestKey, ct);
        session.UpdatedAt = DateTime.UtcNow;

        var userMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Role = "user",
            Content = message,
            CreatedAt = DateTime.UtcNow
        };
        await _chatRepo.AddMessageAsync(userMessage, ct);

        var history = await GetRecentHistoryAsync(session.Id, ct);
        var productContext = await GetProductContextAsync(message, ct);

        var aiRequest = new AiChatProviderRequest
        {
            SystemPrompt = "",
            CurrentMessage = message,
            History = history,
            ProductContext = productContext
        };

        var (reply, provider, fallbackUsed) = await TryProvidersAsync(aiRequest, ct);

        var assistantMessage = new ChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            Role = "assistant",
            Content = reply,
            Provider = provider,
            CreatedAt = DateTime.UtcNow
        };
        await _chatRepo.AddMessageAsync(assistantMessage, ct);

        return new ChatMessageResponse
        {
            SessionId = session.Id,
            Reply = reply,
            Provider = provider,
            FallbackUsed = fallbackUsed,
            CreatedAtUtc = assistantMessage.CreatedAt
        };
    }

    private async Task<ChatSession> GetOrCreateSessionAsync(
        Guid? sessionId,
        Guid? userId,
        string? guestKey,
        CancellationToken ct)
    {
        if (sessionId.HasValue)
        {
            var existing = await _chatRepo.GetSessionByIdAsync(sessionId.Value, ct);
            if (existing != null)
            {
                if (userId.HasValue && existing.UserId != userId)
                {
                    existing.UserId = userId;
                }
                return existing;
            }
        }

        var session = new ChatSession
        {
            Id = sessionId ?? Guid.NewGuid(),
            UserId = userId,
            GuestKey = guestKey,
            Title = "New Chat",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _chatRepo.CreateSessionAsync(session, ct);
    }

    private async Task<List<ChatContextMessage>> GetRecentHistoryAsync(Guid sessionId, CancellationToken ct)
    {
        var session = await _chatRepo.GetSessionByIdWithMessagesAsync(sessionId, MaxHistoryMessages * 2, ct);
        if (session == null || session.Messages.Count == 0)
        {
            return new List<ChatContextMessage>();
        }

        return session.Messages
            .OrderBy(m => m.CreatedAt)
            .TakeLast(MaxHistoryMessages)
            .Select(m => new ChatContextMessage
            {
                Role = m.Role,
                Content = m.Content
            })
            .ToList();
    }

    private async Task<ProductSearchContextDto?> GetProductContextAsync(string message, CancellationToken ct)
    {
        try
        {
            if (!ShouldSearchProducts(message))
            {
                return null;
            }

            var searchTerms = ExtractSearchTerms(message);
            if (searchTerms.Count == 0)
            {
                return null;
            }

            var searchQuery = string.Join(" ", searchTerms);
            var (products, _) = await _productRepo.GetPagedAsync(
                new DTOs.Products.ProductQueryRequest
                {
                    Search = searchQuery,
                    Smart = true,
                    Page = 1,
                    PageSize = MaxProductsInContext
                }, ct);

            if (products.Count == 0)
            {
                return null;
            }

            return new ProductSearchContextDto
            {
                Products = products.Select(p => new ProductContextItem
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price,
                    Creator = p.Creator,
                    IsPro = p.IsPro,
                    License = p.License.ToString(),
                    Tags = p.Tags
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get product context for chat");
            return null;
        }
    }

    private bool ShouldSearchProducts(string message)
    {
        var msg = message.ToLowerInvariant();
        if (msg.Length < 3) return false;

        // Greetings and simple conversational phrases
        var greetings = new[] { "chào", "hello", "hi", "hey", "tạm biệt", "bye", "cảm ơn", "thanks", "ok", "vâng", "dạ", "khỏe", "đang làm gì" };
        if (greetings.Any(g => msg.Contains(g))) return false;

        return true;
    }

    private List<string> ExtractSearchTerms(string message)
    {
        var terms = new List<string>();
        var keywordsToIgnore = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "tìm", "tìm kiếm", "model", "file", "mình", "tôi", "muốn", "cần", "cho", "với",
            "là", "có", "không", "ở", "đây", "gì", "nào", "bao", "nhiêu", "về", "của", "và", "nhé",
            "what", "how", "where", "can", "i", "want", "find", "search", "me", "my",
            "thế", "nào", "như", "thế", "sao", "hỏi", "hướng", "dẫn", "bạn", "cậu", "mày", "anh", "chị", "em"
        };

        var words = message.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words)
        {
            var cleanWord = word.Trim(',', '.', '?', '!', ':', ';', '"', '\'', '(', ')', '[', ']');
            if (cleanWord.Length >= 2 && !keywordsToIgnore.Contains(cleanWord))
            {
                terms.Add(cleanWord);
            }
        }

        return terms.Take(5).ToList();
    }

    private async Task<(string reply, string provider, bool fallbackUsed)> TryProvidersAsync(
        AiChatProviderRequest request,
        CancellationToken ct)
    {
        var orderedProviders = _providers.OrderBy(p =>
            p.Name switch
            {
                "GeminiFree" => 0,
                "GeminiCheap" => 1,
                "RuleBased" => 2,
                _ => 99
            }).ToList();

        IAiChatProvider? firstAttemptedProvider = null;
        string lastError = "";
        bool fallbackUsed = false;

        foreach (var provider in orderedProviders)
        {
            if (firstAttemptedProvider == null)
            {
                firstAttemptedProvider = provider;
            }

            _logger.LogInformation("[ChatRouter] Trying provider: {Provider}", provider.Name);

            var result = await provider.GenerateAsync(request, ct);

            if (result.Success)
            {
                _logger.LogInformation("[ChatRouter] Provider {Provider} succeeded", provider.Name);
                return (result.Reply!, provider.Name, fallbackUsed);
            }

            lastError = result.ErrorMessage ?? "Unknown error";
            _logger.LogWarning("[ChatRouter] Provider {Provider} failed: {Error}", provider.Name, lastError);

            if (provider.Name != "RuleBased" && result.ShouldFallback())
            {
                fallbackUsed = true;
                _logger.LogInformation("[ChatRouter] Falling back from {Provider} due to: {Reason}",
                    provider.Name, lastError);
                continue;
            }

            if (provider.Name == "RuleBased")
            {
                return (result.Reply ?? "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.", provider.Name, fallbackUsed);
            }
        }

        return ("Xin lỗi, hiện tại không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.", "System", fallbackUsed);
    }
}

public interface IChatRateLimiter
{
    bool IsAllowed(string key, int dailyLimit);
    int GetRemaining(string key, int dailyLimit);
}
