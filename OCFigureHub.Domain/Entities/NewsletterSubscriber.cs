using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class NewsletterSubscriber : BaseEntity
{
    public string Email { get; set; } = default!;
    public bool IsActive { get; set; } = true;
    public DateTime? UnsubscribedAt { get; set; }
}
