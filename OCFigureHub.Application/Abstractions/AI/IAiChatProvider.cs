using OCFigureHub.Application.DTOs.Chat;

namespace OCFigureHub.Application.Abstractions.AI;

public interface IAiChatProvider
{
    string Name { get; }
    Task<AiChatProviderResult> GenerateAsync(AiChatProviderRequest request, CancellationToken ct);
}
