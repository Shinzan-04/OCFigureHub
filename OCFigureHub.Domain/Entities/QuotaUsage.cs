using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class QuotaUsage : BaseEntity
{
    public Guid UserId { get; set; }
    public string YearMonth { get; set; } = default!; // "2026-01"
    public int UsedDownloads { get; set; }
    public int LimitDownloads { get; set; }
}
