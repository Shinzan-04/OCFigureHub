using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string DisplayName { get; set; } = default!;

    public Role Role { get; set; } // "Customer" | "Admin"
}
