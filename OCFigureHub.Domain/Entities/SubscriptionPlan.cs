using OCFigureHub.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Domain.Entities;

public class SubscriptionPlan : BaseEntity
{
    [MaxLength(100)]
    public string Name { get; set; } = "";

    public decimal MonthlyPrice { get; set; }

    public int MonthlyQuotaDownloads { get; set; }

    public bool IsEnabled { get; set; } = true;
}
