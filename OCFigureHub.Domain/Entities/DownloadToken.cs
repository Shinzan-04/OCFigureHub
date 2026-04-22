using OCFigureHub.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Domain.Entities;

public class DownloadToken : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }

    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }

    public Guid ProductFileId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
