using OCFigureHub.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Domain.Entities;

public class QuotaUsage : BaseEntity
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    // "yyyy-MM"
    [MaxLength(7)]
    public string YearMonth { get; set; } = "";

    public int UsedDownloads { get; set; }
    public int LimitDownloads { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
