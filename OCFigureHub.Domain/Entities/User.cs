using OCFigureHub.Domain.Common;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Domain.Entities;

public class User : BaseEntity
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string DisplayName { get; set; } = default!;

    public Role Role { get; set; } = Role.Customer;
    public UserStatus Status { get; set; } = UserStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
