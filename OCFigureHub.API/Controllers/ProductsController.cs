using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Application.Services;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductService _svc;

    public ProductsController(ProductService svc)
    {
        _svc = svc;
    }

    /// <summary>
    /// Browse products with search, filter, sort, and pagination (public, no auth required)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? format,
        [FromQuery] string? license,
        [FromQuery] string? sort,
        [FromQuery] bool smart = true,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var request = new ProductQueryRequest
            {
                Search = search,
                Category = category,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                Format = format,
                License = license,
                Sort = sort,
                Smart = smart,
                Page = page,
                PageSize = pageSize
            };

            var result = await _svc.GetPagedAsync(request, ct);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get product detail with file list (public, no auth required)
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        Guid? userId = null;
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(sub, out var parsedId))
        {
            userId = parsedId;
        }

        var detail = await _svc.GetDetailAsync(id, userId, ct);
        if (detail == null) return NotFound("Product not found");
        return Ok(detail);
    }
}
