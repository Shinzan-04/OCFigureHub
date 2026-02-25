using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.DTOs.Products;

public class ProductFileDto
{
    public Guid Id { get; set; }
    public FileType FileType { get; set; }
    public string Format { get; set; } = default!;
    public long FileSize { get; set; }
}
