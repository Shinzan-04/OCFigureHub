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
    public async Task<IActionResult> Request01([FromBody] DownloadRequestDto req, CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr))
            return Unauthorized();

        var userId = Guid.Parse(userIdStr);

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();



        var result = await _downloadService.RequestSignedUrlAsync(userId, req, ip, userAgent, ct);
        return Ok(result);
    }
}
