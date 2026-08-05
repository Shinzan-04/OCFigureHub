using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.DTOs.AdminStats;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/saved-items")]
[Authorize(Roles = "Admin")]
public class AdminSavedItemsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminSavedItemsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetSavedItemsData(CancellationToken ct)
    {
        var savedStats = await _db.SavedItems
            .Include(x => x.User)
            .GroupBy(x => new { x.UserId, x.User.DisplayName, x.User.Email, x.User.AvatarUrl })
            .Select(g => new AdminSavedItemUserDto
            {
                UserId = g.Key.UserId,
                Username = g.Key.DisplayName ?? g.Key.Email,
                Avatar = g.Key.AvatarUrl,
                TotalSaved = g.Count(),
                LastActive = g.Max(x => x.SavedAt)
            })
            .ToListAsync(ct);

        var result = new AdminSavedItemsResponseDto
        {
            SavedEntries = savedStats
        };

        return Ok(result);
    }
}
