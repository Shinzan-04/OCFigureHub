using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class DownloadHistory : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }

    public Guid? OrderId { get; set; }
    public Guid? SubscriptionId { get; set; }

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public bool Success { get; set; }
    public string? FailureReason { get; set; }
    public DateTime DownloadedAt { get; set; } = DateTime.UtcNow;
}
