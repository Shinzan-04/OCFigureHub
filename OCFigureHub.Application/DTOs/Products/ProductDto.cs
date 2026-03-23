namespace OCFigureHub.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string Creator { get; set; } = default!;
    public string? ThumbnailUrl { get; set; }
    public bool IsPro { get; set; }
    public decimal Price { get; set; }
    public bool IsEnabled { get; set; }
    public string Tags { get; set; } = string.Empty;
}
