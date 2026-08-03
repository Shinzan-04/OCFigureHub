using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class PublicSettingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IStorageService _storage;

    public PublicSettingsController(AppDbContext db, IStorageService storage)
    {
        _db = db;
        _storage = storage;
    }

    [HttpGet("hero-models")]
    public async Task<IActionResult> GetHeroModels(CancellationToken ct)
    {
        var setting = await _db.SiteSettings
            .FirstOrDefaultAsync(s => s.Group == "appearance" && s.Key == "heroModels", ct);

        if (setting == null || string.IsNullOrWhiteSpace(setting.Value))
        {
            return Ok(Array.Empty<string>());
        }

        try
        {
            var storageKeys = JsonSerializer.Deserialize<List<string>>(setting.Value);
            if (storageKeys == null || !storageKeys.Any())
            {
                return Ok(Array.Empty<string>());
            }

            // Tạo SAS URL thời hạn 24 tiếng cho từng file model
            var urls = storageKeys.Select(key => _storage.GenerateReadSasUrl(key, TimeSpan.FromHours(24))).ToList();
            return Ok(urls);
        }
        catch
        {
            return Ok(Array.Empty<string>());
        }
    }
}
