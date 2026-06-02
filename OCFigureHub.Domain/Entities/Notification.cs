using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = "info"; // info, success, warning, order, download, system
    public string? Link { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
}
