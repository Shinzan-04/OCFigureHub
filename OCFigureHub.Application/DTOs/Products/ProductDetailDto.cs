namespace OCFigureHub.Application.DTOs.Products;

public class ProductDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string Category { get; set; } = default!;
    public decimal Price { get; set; }
    public bool IsEnabled { get; set; }
    public List<ProductFileDto> Files { get; set; } = new();
}
