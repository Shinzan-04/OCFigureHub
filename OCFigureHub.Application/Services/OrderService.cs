using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Orders;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.Services;

public class OrderService
{
    private readonly IOrderRepository _orders;

    public OrderService(IOrderRepository orders)
    {
        _orders = orders;
    }

    public async Task<OrderDto> BuyNowPaidImmediatelyAsync(Guid userId, BuyNowRequest req, CancellationToken ct)
    {
        var product = await _orders.GetEnabledProductAsync(req.ProductId, ct);
        if (product == null) throw new Exception("Product not found/disabled");

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = OrderStatus.Paid, // PAID NGAY để demo chấm đồ án
            TotalAmount = product.Price,
            CreatedAt = DateTime.UtcNow
        };

        var item = new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            ProductId = product.Id,
            LicenseType = req.LicenseType,
            UnitPrice = product.Price,
            CreatedAt = DateTime.UtcNow
        };

        await _orders.AddOrderAsync(order, ct);
        await _orders.AddOrderItemAsync(item, ct);
        await _orders.SaveChangesAsync(ct);

        return new OrderDto
        {
            OrderId = order.Id,
            Status = order.Status,
            TotalAmount = order.TotalAmount
        };
    }
    public async Task MarkPaidAsync(
    Guid orderId,
    string paymentRef,
    CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct)
                    ?? throw new Exception("Order not found");

        if (order.Status == OrderStatus.Paid)
            return;

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.PaymentRef = paymentRef;

        await _orders.UpdateAsync(order, ct);
        await _orders.SaveChangesAsync(ct);
    }

}
