using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserRepository _users;

    public AdminUsersController(IUserRepository users)
    {
        _users = users;
    }

    /// <summary>
    /// List all users with pagination and search
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var users = await _users.GetAllAsync(page, pageSize, search, ct);
        var total = await _users.GetCountAsync(search, ct);

        return Ok(new
        {
            items = users.Select(u => new
            {
                u.Id,
                u.Email,
                u.DisplayName,
                Role = u.Role.ToString(),
                Status = u.Status.ToString(),
                u.CreatedAt
            }),
            page,
            pageSize,
            totalItems = total,
            totalPages = (int)Math.Ceiling((double)total / pageSize)
        });
    }

    /// <summary>
    /// Update user status (Lock/Unlock)
    /// </summary>
    [HttpPut("{userId:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid userId, [FromBody] UpdateUserStatusRequest req, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user == null) return NotFound("User not found");

        if (Enum.TryParse<OCFigureHub.Domain.Enums.UserStatus>(req.Status, true, out var status))
        {
            user.Status = status;
            await _users.UpdateAsync(user, ct);
            await _users.SaveChangesAsync(ct);
            return Ok(new { message = "Status updated" });
        }
        return BadRequest("Invalid status value");
    }
}

public class UpdateUserStatusRequest
{
    public string Status { get; set; } = default!;
}
