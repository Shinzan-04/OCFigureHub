using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Downloads;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DownloadsController : ControllerBase
{
    private readonly DownloadService _downloadService;

    public DownloadsController(DownloadService downloadService)
    {
        _downloadService = downloadService;
    }

    [Authorize(Roles = "Customer,Admin")]
    [HttpPost("request")]
    public async Task<IActionResult> RequestDownload([FromBody] DownloadRequestDto req, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _downloadService.RequestTokenAsync(userId, req, ip, userAgent, ct);
        return Ok(result);
    }

    [AllowAnonymous] // Token itself is the security bearer
    [HttpGet("file/{tokenId}")]
    public async Task<IActionResult> DownloadFile(Guid tokenId, CancellationToken ct)
    {
        try
        {
            var (stream, fileName, contentType) = await _downloadService.GetDownloadFileAsync(tokenId, ct);
            return File(stream, contentType, fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Customer,Admin")]
    [HttpGet("history")]
    public async Task<IActionResult> History(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var list = await _downloadService.GetHistoryAsync(userId, ct);
        return Ok(list);
    }
}
