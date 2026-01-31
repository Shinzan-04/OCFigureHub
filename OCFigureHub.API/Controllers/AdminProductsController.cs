using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OCFigureHub.Application.DTOs.Products;
using OCFigureHub.Application.Services;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.API.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly AdminProductService _svc;

    public AdminProductsController(AdminProductService svc)
    {
        _svc = svc;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdminCreateProductRequest req, CancellationToken ct)
    {
        var p = await _svc.CreateAsync(req, ct);
        return Ok(p);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminUpdateProductRequest req, CancellationToken ct)
    {
        var p = await _svc.UpdateAsync(id, req, ct);
        return Ok(p);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _svc.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/upload")]
    public async Task<IActionResult> Upload(
        Guid id,
        [FromQuery] FileType fileType,
        [FromQuery] string format,
        IFormFile file,
        CancellationToken ct)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty");

        using var stream = file.OpenReadStream();
        await _svc.UploadFileAsync(
            productId: id,
            fileType: fileType,
            format: format,
            stream: stream,
            fileName: file.FileName,
            contentType: file.ContentType,
            ct: ct
        );

        return Ok(new { message = "Uploaded successfully" });
    }
}
