using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/public-config")]
public class PublicConfigController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicConfigController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var settings = await _db.SiteSettings
            .Where(s => s.Group == "general" && (s.Key == "allowRegistration" || s.Key == "maintenanceMode"))
            .ToListAsync(ct);

        var allowRegStr = settings.FirstOrDefault(s => s.Key == "allowRegistration")?.Value ?? "true";
        var maintenanceStr = settings.FirstOrDefault(s => s.Key == "maintenanceMode")?.Value ?? "false";

        return Ok(new
        {
            allowRegistration = allowRegStr.ToLower() == "true",
            maintenanceMode = maintenanceStr.ToLower() == "true"
        });
    }
}
