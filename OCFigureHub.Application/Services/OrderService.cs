using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Orders;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;

namespace OCFigureHub.Application.Services;

public class OrderService
{
    private readonly IOrderRepository _orders;
    private readonly IEmailService _email;
    private readonly ISiteSettingRepository _settings;

    public OrderService(IOrderRepository orders, IEmailService email, ISiteSettingRepository settings)
    {
        _orders = orders;
        _email = email;
        _settings = settings;
    }

    public async Task<OrderDto> BuyNowPaidImmediatelyAsync(Guid userId, BuyNowRequest req, CancellationToken ct)
    {
        var product = await _orders.GetEnabledProductAsync(req.ProductId, ct);
        if (product == null) throw new Exception("Product not found/disabled");

        // Free products are marked as Paid immediately
        // Paid products start as Pending, only marked Paid after payment callback
        var isFree = product.Price <= 0;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = isFree ? OrderStatus.Paid : OrderStatus.Pending,
            TotalAmount = product.Price,
            PaidAt = isFree ? DateTime.UtcNow : null,
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

        // Send admin notification (best-effort)
        try
        {
            var notify = await _settings.GetValueAsync("notifications", "newOrderEmail", ct);
            if (notify == "true")
            {
                var body = $"<p>A new order has been placed.</p><p>Order ID: {order.Id}</p><p>Total Amount: ${order.TotalAmount}</p><p>Status: {order.Status}</p>";
                await _email.SendAdminNotificationAsync("New Order - OC Figure Hub", body, ct);
            }
        }
        catch { /* log */ }

        return new OrderDto
        {
            OrderId = order.Id,
            Status = order.Status,
            TotalAmount = order.TotalAmount
        };
    }
    public async Task<Order> MarkPaidAsync(
    Guid orderId,
    string paymentRef,
    CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct)
                    ?? throw new Exception("Order not found");

        if (order.Status == OrderStatus.Paid)
            return order;

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.PaymentRef = paymentRef;

        await _orders.UpdateAsync(order, ct);
        await _orders.SaveChangesAsync(ct);
        
        return order;
    }

    public async Task<Order> MarkCancelledAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _orders.GetByIdAsync(orderId, ct)
                    ?? throw new Exception("Order not found");

        if (order.Status != OrderStatus.Pending)
            return order;

        order.Status = OrderStatus.Expired;
        await _orders.UpdateAsync(order, ct);
        await _orders.SaveChangesAsync(ct);
        
        return order;
    }
}
