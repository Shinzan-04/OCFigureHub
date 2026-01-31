using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = default!;

    public bool IsActive { get; set; } = true;
    public DateTime StartAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndAt { get; set; }
}
