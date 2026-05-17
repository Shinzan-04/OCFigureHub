using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using OCFigureHub.Application.DTOs.Chat;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AiChatRouterService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(AiChatRouterService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage(
        [FromBody] ChatMessageRequest request,
        CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { error = "Tin nhắn không được để trống." });
        }

        if (request.Message.Length > 1000)
        {
            return BadRequest(new { error = "Tin nhắn không được vượt quá 1000 ký tự." });
        }

        Guid? userId = null;
        string? guestKey = null;

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(sub, out var parsedId))
        {
            userId = parsedId;
        }
        else
        {
            guestKey = GetClientIpAddress();
        }

        try
        {
            var response = await _chatService.ProcessMessageAsync(request, userId, guestKey, ct);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid chat request");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message");
            return StatusCode(500, new { error = "Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại sau." });
        }
    }

    private string GetClientIpAddress()
    {
        var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        var realIp = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
