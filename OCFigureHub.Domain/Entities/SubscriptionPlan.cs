using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = default!;
    public decimal MonthlyPrice { get; set; }
    public int MonthlyQuotaDownloads { get; set; }
    public bool IsActive { get; set; } = true;
}
