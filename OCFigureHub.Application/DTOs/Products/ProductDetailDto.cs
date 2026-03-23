namespace OCFigureHub.Application.DTOs.Products;

public class ProductDetailDto : ProductDto
{
    public string Description { get; set; } = default!;
    public List<ProductFileDto> Files { get; set; } = new();

    public bool IsOwnedByUser { get; set; }
    public bool HasActiveSubscription { get; set; }
    public int RemainingDownloads { get; set; }
}
