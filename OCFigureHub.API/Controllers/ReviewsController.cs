using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db) => _db = db;

    /// <summary>Get reviews for a product</summary>
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(Guid productId, CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                userId = r.UserId,
                userName = r.User.DisplayName
            })
            .ToListAsync(ct);

        var avg = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;

        return Ok(new { reviews, averageRating = Math.Round(avg, 1), totalReviews = reviews.Count });
    }

    /// <summary>Add or update review</summary>
    [HttpPost("product/{productId}")]
    [Authorize]
    public async Task<IActionResult> AddReview(Guid productId, [FromBody] ReviewRequest req, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        if (req.Rating < 1 || req.Rating > 5)
            return BadRequest(new { error = "Rating phải từ 1-5" });

        var existing = await _db.Reviews
            .FirstOrDefaultAsync(r => r.UserId == userId.Value && r.ProductId == productId, ct);

        if (existing != null)
        {
            existing.Rating = req.Rating;
            existing.Comment = req.Comment;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _db.Reviews.Add(new Review
            {
                UserId = userId.Value,
                ProductId = productId,
                Rating = req.Rating,
                Comment = req.Comment
            });
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Đánh giá thành công" });
    }

    /// <summary>Delete own review</summary>
    [HttpDelete("{reviewId}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(Guid reviewId, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId.Value, ct);
        if (review == null) return NotFound();

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(ct);
        return Ok(new { message = "Đã xoá đánh giá" });
    }

    private Guid? GetUserId()
    {
        var str = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(str, out var id) ? id : null;
    }
}

public class ReviewRequest
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
