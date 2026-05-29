using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly IOrderRepository _orders;
    private readonly ISubscriptionRepository _subscriptions;
    private readonly IDownloadRepository _downloads;

    public ProfileController(
        IUserRepository users,
        IOrderRepository orders,
        ISubscriptionRepository subscriptions,
        IDownloadRepository downloads)
    {
        _users = users;
        _orders = orders;
        _subscriptions = subscriptions;
        _downloads = downloads;
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _users.GetByIdAsync(userId.Value, ct);
        if (user == null) return NotFound("User not found");

        // Get active subscription
        var sub = await _subscriptions.GetActiveSubscriptionAsync(userId.Value, ct);

        // Get download count
        var downloadCount = await _downloads.GetUserDownloadCountAsync(userId.Value, ct);

        // Get order count
        var orderCount = await _orders.GetUserOrderCountAsync(userId.Value, ct);

        return Ok(new
        {
            user.Id,
            user.Email,
            user.DisplayName,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            user.CreatedAt,
            subscription = sub != null ? new
            {
                planName = sub.Plan?.Name,
                expiresAt = sub.EndAt,
                isActive = sub.IsActive
            } : null,
            stats = new
            {
                totalDownloads = downloadCount,
                totalOrders = orderCount
            }
        });
    }

    /// <summary>
    /// Update display name
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _users.GetByIdAsync(userId.Value, ct);
        if (user == null) return NotFound("User not found");

        if (!string.IsNullOrWhiteSpace(req.DisplayName))
        {
            user.DisplayName = req.DisplayName.Trim();
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        return Ok(new
        {
            message = "Profile updated",
            user.DisplayName
        });
    }

    /// <summary>
    /// Change password
    /// </summary>
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _users.GetByIdAsync(userId.Value, ct);
        if (user == null) return NotFound("User not found");

        // Verify current password
        var hasher = HttpContext.RequestServices.GetRequiredService<Application.Abstractions.IPasswordHasher>();
        if (!hasher.Verify(req.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { error = "Mật khẩu hiện tại không đúng" });
        }

        if (req.NewPassword.Length < 6)
        {
            return BadRequest(new { error = "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        user.PasswordHash = hasher.Hash(req.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _users.UpdateAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        return Ok(new { message = "Đổi mật khẩu thành công" });
    }

    private Guid? GetUserId()
    {
        var str = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(str, out var id) ? id : null;
    }
}

public class UpdateProfileRequest
{
    public string? DisplayName { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = default!;
    public string NewPassword { get; set; } = default!;
}
