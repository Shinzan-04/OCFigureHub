using System.ComponentModel.DataAnnotations;

namespace OCFigureHub.Application.DTOs.Users;

public class UpdateProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string DisplayName { get; set; } = default!;

    [StringLength(500)]
    public string? Bio { get; set; }
}
