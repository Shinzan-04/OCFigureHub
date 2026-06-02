using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
public class CmsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CmsController(AppDbContext db) => _db = db;

    /// <summary>Public: Get enabled content by type</summary>
    [HttpGet("{type}")]
    public async Task<IActionResult> GetByType(string type, CancellationToken ct)
    {
        var items = await _db.CmsContents
            .Where(c => c.Type == type && c.IsEnabled)
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id, c.Type, c.Title, c.Subtitle, c.CtaText, c.CtaLink,
                c.ImageUrl, c.BgColor, c.JsonData, c.SortOrder
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    /// <summary>Admin: Get all content (including disabled)</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await _db.CmsContents
            .OrderBy(c => c.Type).ThenBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id, c.Type, c.Title, c.Subtitle, c.CtaText, c.CtaLink,
                c.ImageUrl, c.BgColor, c.JsonData, c.SortOrder, c.IsEnabled, c.CreatedAt
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    /// <summary>Admin: Create content</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CmsContentRequest req, CancellationToken ct)
    {
        var content = new CmsContent
        {
            Type = req.Type,
            Title = req.Title,
            Subtitle = req.Subtitle,
            CtaText = req.CtaText,
            CtaLink = req.CtaLink,
            ImageUrl = req.ImageUrl,
            BgColor = req.BgColor ?? "#8B5CF6",
            JsonData = req.JsonData,
            SortOrder = req.SortOrder,
            IsEnabled = req.IsEnabled ?? true
        };

        _db.CmsContents.Add(content);
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Created", content.Id });
    }

    /// <summary>Admin: Update content</summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CmsContentRequest req, CancellationToken ct)
    {
        var content = await _db.CmsContents.FindAsync(new object[] { id }, ct);
        if (content == null) return NotFound();

        content.Type = req.Type ?? content.Type;
        content.Title = req.Title ?? content.Title;
        content.Subtitle = req.Subtitle;
        content.CtaText = req.CtaText;
        content.CtaLink = req.CtaLink;
        content.ImageUrl = req.ImageUrl;
        if (req.BgColor != null) content.BgColor = req.BgColor;
        if (req.JsonData != null) content.JsonData = req.JsonData;
        content.SortOrder = req.SortOrder;
        if (req.IsEnabled.HasValue) content.IsEnabled = req.IsEnabled.Value;
        content.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Updated" });
    }

    /// <summary>Admin: Delete content</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var content = await _db.CmsContents.FindAsync(new object[] { id }, ct);
        if (content == null) return NotFound();

        _db.CmsContents.Remove(content);
        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Deleted" });
    }
}

public class CmsContentRequest
{
    public string Type { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Subtitle { get; set; }
    public string? CtaText { get; set; }
    public string? CtaLink { get; set; }
    public string? ImageUrl { get; set; }
    public string? BgColor { get; set; }
    public string? JsonData { get; set; }
    public int SortOrder { get; set; }
    public bool? IsEnabled { get; set; }
}
