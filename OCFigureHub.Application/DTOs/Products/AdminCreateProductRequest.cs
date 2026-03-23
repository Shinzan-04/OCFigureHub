namespace OCFigureHub.Application.DTOs.Products;

public class AdminCreateProductRequest
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string Category { get; set; } = "General";
    public string Creator { get; set; } = "Unknown";
    public bool IsPro { get; set; }
    public string Tags { get; set; } = string.Empty;
}
