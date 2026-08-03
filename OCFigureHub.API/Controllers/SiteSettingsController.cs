using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class SiteSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;
    private readonly IModelOptimizer _optimizer;

    public SiteSettingsController(AppDbContext db, IStorageService storage, IModelOptimizer optimizer)
    {
        _db = db;
        _storage = storage;
        _optimizer = optimizer;
    }

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

    /// <summary>Upload a hero 3D model</summary>
    [HttpPost("upload-hero")]
    public async Task<IActionResult> UploadHeroModel(IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("No file provided");
        
        using var stream = file.OpenReadStream();
        
        // Cực kỳ quan trọng: Nén file 3D bằng thuật toán Draco trước khi upload
        var optimizedStream = await _optimizer.OptimizeAsync(stream, "GLB", ct);
        
        var (storageKey, _) = await _storage.UploadAsync(optimizedStream, file.FileName, file.ContentType, ct);
        
        return Ok(new { storageKey });
    }
}
