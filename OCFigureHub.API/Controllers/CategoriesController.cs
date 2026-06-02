using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db) => _db = db;

    /// <summary>Get all enabled categories (public)</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var categories = await _db.Categories
            .Where(c => c.IsEnabled)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.Icon,
                c.Color,
                c.SortOrder,
                productCount = _db.Products.Count(p => p.Category == c.Name && p.IsEnabled)
            })
            .ToListAsync(ct);

        return Ok(categories);
    }

    /// <summary>Admin: Get all categories including disabled</summary>
    [HttpGet("admin")]
    [Authorize]
    public async Task<IActionResult> GetAllAdmin(CancellationToken ct)
    {
        var categories = await _db.Categories
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.Icon,
                c.Color,
                c.SortOrder,
                c.IsEnabled,
                c.CreatedAt,
                productCount = _db.Products.Count(p => p.Category == c.Name)
            })
            .ToListAsync(ct);

        return Ok(categories);
    }

    /// <summary>Admin: Create category</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CategoryRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { error = "Tên category không được trống" });

        var slug = req.Slug ?? req.Name.ToLowerInvariant().Replace(" ", "-");

        if (await _db.Categories.AnyAsync(c => c.Slug == slug, ct))
            return BadRequest(new { error = "Slug đã tồn tại" });

        var category = new Category
        {
            Name = req.Name.Trim(),
            Slug = slug,
            Description = req.Description,
            Icon = req.Icon,
            Color = req.Color ?? "#8B5CF6",
            SortOrder = req.SortOrder,
            IsEnabled = true
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Tạo category thành công", category.Id, category.Name, category.Slug });
    }

    /// <summary>Admin: Update category</summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] CategoryRequest req, CancellationToken ct)
    {
        var cat = await _db.Categories.FindAsync(new object[] { id }, ct);
        if (cat == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(req.Name)) cat.Name = req.Name.Trim();
        if (req.Slug != null) cat.Slug = req.Slug;
        if (req.Description != null) cat.Description = req.Description;
        if (req.Icon != null) cat.Icon = req.Icon;
        if (req.Color != null) cat.Color = req.Color;
        cat.SortOrder = req.SortOrder;
        if (req.IsEnabled.HasValue) cat.IsEnabled = req.IsEnabled.Value;
        cat.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Cập nhật thành công" });
    }

    /// <summary>Admin: Delete category</summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var cat = await _db.Categories.FindAsync(new object[] { id }, ct);
        if (cat == null) return NotFound();

        _db.Categories.Remove(cat);
        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Đã xoá category" });
    }
}

public class CategoryRequest
{
    public string Name { get; set; } = default!;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int SortOrder { get; set; }
    public bool? IsEnabled { get; set; }
}
