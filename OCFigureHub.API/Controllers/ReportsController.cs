using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reports;

    public ReportsController(ReportService reports)
    {
        _reports = reports;
    }

    [HttpGet("sales")]
    public async Task<IActionResult> Sales([FromQuery] DateTime fromUtc, [FromQuery] DateTime toUtc, CancellationToken ct)
    {
        var res = await _reports.GetSalesAsync(fromUtc, toUtc, ct);
        return Ok(res);
    }

    [HttpGet("downloads")]
    public async Task<IActionResult> Downloads([FromQuery] DateTime fromUtc, [FromQuery] DateTime toUtc, CancellationToken ct)
    {
        var res = await _reports.GetDownloadsAsync(fromUtc, toUtc, ct);
        return Ok(res);
    }
}
