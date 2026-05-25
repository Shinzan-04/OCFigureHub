namespace OCFigureHub.Application.DTOs.SavedItems;

public class SavedItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string Category { get; set; } = default!;
    public string Creator { get; set; } = default!;
    public decimal Price { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? PreviewModelUrl { get; set; }
    public string License { get; set; } = default!;
    public bool IsPro { get; set; }
    public DateTime SavedAt { get; set; }
}
