using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public int Rating { get; set; } // 1-5
    public string? Comment { get; set; }
}
