namespace OCFigureHub.Application.DTOs.Chat;

public class ChatMessageResponse
{
    public Guid SessionId { get; set; }
    public string Reply { get; set; } = default!;
    public string Provider { get; set; } = default!;
    public bool FallbackUsed { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
