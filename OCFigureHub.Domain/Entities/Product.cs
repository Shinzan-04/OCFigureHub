using OCFigureHub.Domain.Common;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string Category { get; set; } = "General";
    public string Creator { get; set; } = "Unknown";
    public string? ThumbnailUrl { get; set; }
    public string? PreviewModelUrl { get; set; }
    public bool IsPro { get; set; } = false;
    public bool IsEnabled { get; set; } = true;
    public string Tags { get; set; } = string.Empty;
    public LicenseType License { get; set; } = LicenseType.Personal;

    public ICollection<ProductFile> Files { get; set; } = new List<ProductFile>();
    public ICollection<DownloadHistory> DownloadHistories { get; set; } = new List<DownloadHistory>();
}
