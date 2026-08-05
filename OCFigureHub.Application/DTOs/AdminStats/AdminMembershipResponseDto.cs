namespace OCFigureHub.Application.DTOs.AdminStats;

public class AdminMembershipResponseDto
{
    public List<AdminMembershipUserDto> Members { get; set; } = new();
    public List<AdminMonthlyRevenueDto> MonthlyRevenue { get; set; } = new();
}

public class AdminMembershipUserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Plan { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Amount { get; set; }
    public string? Avatar { get; set; }
}

public class AdminMonthlyRevenueDto
{
    public string Month { get; set; } = "";
    public decimal Revenue { get; set; }
}
