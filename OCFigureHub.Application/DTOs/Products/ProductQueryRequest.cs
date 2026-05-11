namespace OCFigureHub.Application.DTOs.Products;

public class ProductQueryRequest
{
    public string? Search { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Format { get; set; }
    public string? License { get; set; }
    public string? Sort { get; set; }
    public bool Smart { get; set; } = true;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
