using OCFigureHub.Domain.Common;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Domain.Entities;

public class ProductFile : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public FileType FileType { get; set; }
    public string Format { get; set; } = default!; // STL/OBJ/GLB/JPG
    public string StorageKey { get; set; } = default!; // blob path
    public long FileSize { get; set; }
    public string? Sha256 { get; set; }
}
