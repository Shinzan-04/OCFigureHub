using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Auth;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var res = await _auth.RegisterAsync(req, ct);
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
}
