using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicStatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicStatsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetPlatformStats(CancellationToken ct)
    {
        var totalModels = await _db.Products.CountAsync(ct);
        var totalCreators = await _db.Products.Select(p => p.Creator).Distinct().CountAsync(ct);
        
        // Approximate total downloads. Using actual records from DownloadHistories is more accurate.
        var totalDownloads = await _db.DownloadHistories.CountAsync(d => d.Success, ct);
        
        var totalMembers = await _db.Users.CountAsync(ct);

        return Ok(new
        {
            models = totalModels,
            creators = totalCreators,
            downloads = totalDownloads,
            members = totalMembers
        });
    }
}
