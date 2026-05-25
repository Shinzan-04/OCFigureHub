using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class SavedItem : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
