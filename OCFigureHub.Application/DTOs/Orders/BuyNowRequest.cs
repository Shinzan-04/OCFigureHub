using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.DTOs.Orders;

public class BuyNowRequest
{
    public Guid ProductId { get; set; }
    public LicenseType LicenseType { get; set; } = LicenseType.Personal;
}
