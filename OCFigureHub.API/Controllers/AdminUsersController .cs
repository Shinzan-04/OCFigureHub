using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.AdminUsers;
using OCFigureHub.Domain.Enums;

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

    [HttpPut("{userId:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid userId, [FromBody] SetUserStatusRequestDto req, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(userId, ct);
        if (user == null) return NotFound("User not found");

        user.Status = req.Lock ? UserStatus.Locked : UserStatus.Active;
        await _users.UpdateAsync(user, ct);

        return Ok(new { user.Id, user.Email, user.Status });
    }
}
