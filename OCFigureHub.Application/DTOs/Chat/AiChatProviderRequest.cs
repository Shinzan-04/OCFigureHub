namespace OCFigureHub.Application.DTOs.Chat;

public class AiChatProviderRequest
{
    public string SystemPrompt { get; set; } = default!;
    public List<ChatContextMessage> History { get; set; } = new();
    public string CurrentMessage { get; set; } = default!;
    public ProductSearchContextDto? ProductContext { get; set; }
}

public class ChatContextMessage
{
    public string Role { get; set; } = default!;
    public string Content { get; set; } = default!;
}

public class ProductSearchContextDto
{
    public List<ProductContextItem> Products { get; set; } = new();
}

public class ProductContextItem
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public decimal Price { get; set; }
    public string Creator { get; set; } = default!;
    public bool IsPro { get; set; }
    public string License { get; set; } = default!;
    public string Tags { get; set; } = string.Empty;
}
