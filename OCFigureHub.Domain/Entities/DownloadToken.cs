using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class DownloadToken : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }

    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; } = false;

    public string SignedUrlHash { get; set; } = default!;
}
