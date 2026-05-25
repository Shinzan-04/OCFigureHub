using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Users;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserProfileService _svc;

    public UsersController(UserProfileService svc)
    {
        _svc = svc;
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var id))
            throw new UnauthorizedAccessException("Invalid user token");

        return id;
    }

    /// <summary>
    /// Get full profile of the currently authenticated user (including VIP info)
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile(CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var profile = await _svc.GetProfileAsync(userId, ct);
            return Ok(profile);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Invalid or missing authentication token." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update basic profile info (display name, bio)
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile(
        [FromBody] UpdateProfileRequest req,
        CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            var profile = await _svc.UpdateProfileAsync(userId, req, ct);
            return Ok(profile);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Invalid or missing authentication token." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Upload a new avatar image to Azure Blob Storage and update the user's AvatarUrl
    /// </summary>
    [HttpPost("me/avatar")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5 MB
    public async Task<IActionResult> UploadAvatar(CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();

            if (!Request.HasFormContentType)
                return BadRequest(new { error = "Request must be multipart/form-data." });

            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "No image file provided." });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = "Only JPEG, PNG, GIF, and WebP images are allowed." });

            await using var stream = file.OpenReadStream();
            var result = await _svc.UploadAvatarAsync(
                userId, stream, file.FileName, file.ContentType, ct);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Invalid or missing authentication token." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
