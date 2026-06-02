using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsletterController : ControllerBase
{
    private readonly AppDbContext _db;

    public NewsletterController(AppDbContext db) => _db = db;

    /// <summary>Subscribe to newsletter</summary>
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] NewsletterRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || !req.Email.Contains('@'))
            return BadRequest(new { error = "Email không hợp lệ" });

        var email = req.Email.Trim().ToLowerInvariant();
        var existing = await _db.NewsletterSubscribers
            .FirstOrDefaultAsync(n => n.Email == email, ct);

        if (existing != null)
        {
            if (existing.IsActive)
                return Ok(new { message = "Email đã được đăng ký trước đó" });

            existing.IsActive = true;
            existing.UnsubscribedAt = null;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _db.NewsletterSubscribers.Add(new NewsletterSubscriber { Email = email });
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Đăng ký thành công! Cảm ơn bạn." });
    }

    /// <summary>Unsubscribe from newsletter</summary>
    [HttpPost("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] NewsletterRequest req, CancellationToken ct)
    {
        var email = req.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(email)) return BadRequest(new { error = "Email không hợp lệ" });

        var sub = await _db.NewsletterSubscribers.FirstOrDefaultAsync(n => n.Email == email, ct);
        if (sub == null) return NotFound(new { error = "Email chưa đăng ký" });

        sub.IsActive = false;
        sub.UnsubscribedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Đã huỷ đăng ký" });
    }

    /// <summary>Admin: get all subscribers</summary>
    [HttpGet("subscribers")]
    public async Task<IActionResult> GetSubscribers([FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken ct = default)
    {
        var query = _db.NewsletterSubscribers.OrderByDescending(n => n.CreatedAt);
        var total = await query.CountAsync(ct);
        var active = await _db.NewsletterSubscribers.CountAsync(n => n.IsActive, ct);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new { n.Id, n.Email, n.IsActive, n.CreatedAt, n.UnsubscribedAt })
            .ToListAsync(ct);

        return Ok(new { items, total, active, page, pageSize });
    }
}

public class NewsletterRequest
{
    public string Email { get; set; } = default!;
}
