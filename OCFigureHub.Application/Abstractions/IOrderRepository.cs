using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IOrderRepository
{
    Task<Product?> GetEnabledProductAsync(Guid productId, CancellationToken ct);

    Task AddOrderAsync(Order order, CancellationToken ct);
    Task AddOrderItemAsync(OrderItem item, CancellationToken ct);

    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct);
    Task UpdateAsync(Order order, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);

    Task<List<Order>> GetAllOrdersAsync(int page, int pageSize, CancellationToken ct);
    Task<int> GetOrderCountAsync(CancellationToken ct);
    Task<int> GetUserOrderCountAsync(Guid userId, CancellationToken ct);
}
