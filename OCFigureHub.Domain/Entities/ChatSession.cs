namespace OCFigureHub.Domain.Entities;

public class ChatSession : Common.BaseEntity
{
    public Guid? UserId { get; set; }
    public string? GuestKey { get; set; }
    public string? Title { get; set; }

    public User? User { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
