namespace OCFigureHub.Application.DTOs.Products;

public class AdminUpdateProductRequest
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string Category { get; set; } = "General";
    public bool IsEnabled { get; set; } = true;
}
