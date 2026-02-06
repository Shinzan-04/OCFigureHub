using OCFigureHub.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Domain.Entities;

public class DownloadToken : BaseEntity
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }

    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }

    [MaxLength(128)]
    public string SignedUrlHash { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
