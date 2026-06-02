using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class SiteSettingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SiteSettingsController(AppDbContext db) => _db = db;

    /// <summary>Get all settings, optionally filtered by group</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? group, CancellationToken ct)
    {
        var query = _db.SiteSettings.AsQueryable();
        if (!string.IsNullOrEmpty(group))
            query = query.Where(s => s.Group == group);

        var settings = await query
            .OrderBy(s => s.Group).ThenBy(s => s.Key)
            .Select(s => new { s.Id, s.Group, s.Key, s.Value })
            .ToListAsync(ct);

        // Return as grouped dictionary for easy frontend consumption
        var grouped = settings.GroupBy(s => s.Group)
            .ToDictionary(g => g.Key, g => g.ToDictionary(s => s.Key, s => s.Value));

        return Ok(grouped);
    }

    /// <summary>Save settings (upsert)</summary>
    [HttpPut]
    public async Task<IActionResult> SaveAll([FromBody] Dictionary<string, Dictionary<string, string>> data, CancellationToken ct)
    {
        foreach (var (group, entries) in data)
        {
            foreach (var (key, value) in entries)
            {
                var existing = await _db.SiteSettings
                    .FirstOrDefaultAsync(s => s.Group == group && s.Key == key, ct);

                if (existing != null)
                {
                    existing.Value = value;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _db.SiteSettings.Add(new SiteSetting
                    {
                        Group = group,
                        Key = key,
                        Value = value
                    });
                }
            }
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Settings saved successfully" });
    }
}
