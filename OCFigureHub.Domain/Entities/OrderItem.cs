using OCFigureHub.Domain.Common;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public LicenseType LicenseType { get; set; }
    public decimal UnitPrice { get; set; }
}
