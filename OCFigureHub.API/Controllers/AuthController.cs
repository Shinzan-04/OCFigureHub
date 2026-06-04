using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OCFigureHub.Application.DTOs.Auth;
using OCFigureHub.Application.Services;
using OCFigureHub.API.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("AuthLimiter")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    private readonly NotificationService _notif;

    public AuthController(AuthService auth, NotificationService notif)
    {
        _auth = auth;
        _notif = notif;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var res = await _auth.RegisterAsync(req, ct);
        // Send welcome notification
        try { await _notif.NotifyWelcome(res.UserId, req.DisplayName ?? req.Email, ct); } catch { }
        return Ok(res);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var res = await _auth.LoginAsync(req, ct);
        return Ok(res);
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest req, CancellationToken ct)
    {
        try
        {
            var res = await _auth.LoginWithGoogleAsync(req, ct);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("facebook")]
    public async Task<IActionResult> FacebookLogin([FromBody] FacebookAuthRequest req, CancellationToken ct)
    {
        try
        {
            var res = await _auth.LoginWithFacebookAsync(req, ct);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req, CancellationToken ct)
    {
        await _auth.ForgotPasswordAsync(req, ct);
        return Ok(new { message = "If the email is valid, a reset link will be sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req, CancellationToken ct)
    {
        try
        {
            await _auth.ResetPasswordAsync(req, ct);
            return Ok(new { message = "Password reset successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, [FromQuery] string email, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
            return BadRequest(new { error = "Token and email are required." });

        var success = await _auth.VerifyEmailAsync(email, token, ct);
        if (!success)
            return BadRequest(new { error = "Invalid or expired verification link." });

        return Ok(new { message = "Email verified successfully!" });
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest req, CancellationToken ct)
    {
        await _auth.ResendVerificationAsync(req.Email, ct);
        return Ok(new { message = "If the email is registered and unverified, a new verification link will be sent." });
    }
}

public class ResendVerificationRequest
{
    public string Email { get; set; } = default!;
}
