using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IChatRepository
{
    Task<ChatSession?> GetSessionByIdAsync(Guid sessionId, CancellationToken ct);
    Task<ChatSession?> GetSessionByIdWithMessagesAsync(Guid sessionId, int maxMessages, CancellationToken ct);
    Task<ChatSession> CreateSessionAsync(ChatSession session, CancellationToken ct);
    Task<ChatMessage> AddMessageAsync(ChatMessage message, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
