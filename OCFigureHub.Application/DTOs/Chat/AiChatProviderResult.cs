namespace OCFigureHub.Application.DTOs.Chat;

public class AiChatProviderResult
{
    public bool Success { get; set; }
    public string? Reply { get; set; }
    public string Provider { get; set; } = default!;
    public bool IsRateLimited { get; set; }
    public bool IsQuotaExceeded { get; set; }
    public bool IsTimeout { get; set; }
    public bool IsServerError { get; set; }
    public string? ErrorMessage { get; set; }

    public bool ShouldFallback()
    {
        return !Success && (
            IsRateLimited ||
            IsQuotaExceeded ||
            IsTimeout ||
            IsServerError ||
            ErrorMessage == "API key not configured"
        );
    }
}
