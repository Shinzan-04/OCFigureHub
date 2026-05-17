namespace OCFigureHub.Domain.Entities;

public class ChatMessage : Common.BaseEntity
{
    public Guid SessionId { get; set; }
    public string Role { get; set; } = default!; // "user" or "assistant"
    public string Content { get; set; } = default!;
    public string? Provider { get; set; }

    public ChatSession Session { get; set; } = default!;
}
