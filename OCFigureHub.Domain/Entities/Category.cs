using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string Color { get; set; } = "#8B5CF6";
    public int SortOrder { get; set; } = 0;
    public bool IsEnabled { get; set; } = true;
}
