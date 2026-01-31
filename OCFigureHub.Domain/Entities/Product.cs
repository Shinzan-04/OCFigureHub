using OCFigureHub.Domain.Common;

namespace OCFigureHub.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string Category { get; set; } = "General";
    public bool IsEnabled { get; set; } = true;

    public ICollection<ProductFile> Files { get; set; } = new List<ProductFile>();
}
