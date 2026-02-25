using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class WatermarkInfo : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? DownloadTokenId { get; set; }

    /// <summary>
    /// Unique watermark hash embedded in the file metadata (SHA256 of userId+productId+timestamp)
    /// </summary>
    public string WatermarkHash { get; set; } = default!;

    public DateTime EmbeddedAt { get; set; } = DateTime.UtcNow;
}
