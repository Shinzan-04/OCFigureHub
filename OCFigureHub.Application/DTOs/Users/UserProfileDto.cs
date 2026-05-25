namespace OCFigureHub.Application.DTOs.Users;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // VIP info
    public VipInfoDto? VipInfo { get; set; }
}

public class VipInfoDto
{
    public string? PlanName { get; set; }
    public decimal? MonthlyPrice { get; set; }
    public int? MonthlyQuota { get; set; }
    public int? DownloadsUsed { get; set; }
    public bool IsActive { get; set; }
    public DateTime? EndAt { get; set; }
}
