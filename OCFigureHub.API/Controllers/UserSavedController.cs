using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.Abstractions;
using System.Security.Claims;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Authorize(Roles = "Customer,Admin")]
public class UserSavedController : ControllerBase
{
    private readonly ISavedItemService _savedService;

    public UserSavedController(ISavedItemService savedService)
    {
        _savedService = savedService;
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/users/me/saved")]
    public async Task<IActionResult> GetSavedItems(CancellationToken ct)
    {
        var userId = GetUserId();
        var items = await _savedService.GetSavedItemsAsync(userId, ct);
        return Ok(items);
    }

    [HttpGet("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> IsSaved(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _savedService.IsSavedAsync(userId, productId, ct);
        return Ok(result);
    }

    [HttpPost("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> SaveItem(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _savedService.SaveItemAsync(userId, productId, ct);
        return Ok(new { message = "Item saved successfully." });
    }

    [HttpDelete("api/users/me/saved/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId, CancellationToken ct)
    {
        var userId = GetUserId();
        await _savedService.RemoveItemAsync(userId, productId, ct);
        return Ok(new { message = "Item removed successfully." });
    }
}
