using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Application.DTOs.Auth;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;
}

public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = default!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string NewPassword { get; set; } = default!;
}
