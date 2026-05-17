using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Application.DTOs.Chat;

public class ChatMessageRequest
{
    public Guid? SessionId { get; set; }

    [Required(ErrorMessage = "Message is required")]
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Message must be between 1 and 1000 characters")]
    public string Message { get; set; } = default!;
}
