namespace OCFigureHub.Application.DTOs.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = default!;
    public Guid UserId { get; set; }
    public string Email { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string Role { get; set; } = default!;
}
