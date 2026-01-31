using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.DTOs.Orders;

public class OrderDto
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
}
