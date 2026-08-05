namespace OCFigureHub.Application.DTOs.AdminStats;

public class AdminSavedItemsResponseDto
{
    public List<AdminSavedItemUserDto> SavedEntries { get; set; } = new();
}

public class AdminSavedItemUserDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = "";
    public string? Avatar { get; set; }
    public int TotalSaved { get; set; }
    public DateTime LastActive { get; set; }
}
