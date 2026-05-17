using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _db;
    public ChatRepository(AppDbContext db) => _db = db;

    public async Task<ChatSession?> GetSessionByIdAsync(Guid sessionId, CancellationToken ct)
        => await _db.ChatSessions.FirstOrDefaultAsync(x => x.Id == sessionId, ct);

    public async Task<ChatSession?> GetSessionByIdWithMessagesAsync(Guid sessionId, int maxMessages, CancellationToken ct)
        => await _db.ChatSessions
              .Include(x => x.Messages.OrderByDescending(m => m.CreatedAt).Take(maxMessages))
              .FirstOrDefaultAsync(x => x.Id == sessionId, ct);

    public async Task<ChatSession> CreateSessionAsync(ChatSession session, CancellationToken ct)
    {
        await _db.ChatSessions.AddAsync(session, ct);
        await _db.SaveChangesAsync(ct);
        return session;
    }

    public async Task<ChatMessage> AddMessageAsync(ChatMessage message, CancellationToken ct)
    {
        await _db.ChatMessages.AddAsync(message, ct);
        await _db.SaveChangesAsync(ct);
        return message;
    }

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
