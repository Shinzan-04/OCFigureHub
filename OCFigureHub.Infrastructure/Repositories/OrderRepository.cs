using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public OrderRepository(AppDbContext db)
    {
        _db = db;
    }

    // ==============================
    // PRODUCT
    // ==============================

    public Task<Product?> GetEnabledProductAsync(Guid productId, CancellationToken ct)
        => _db.Products
              .FirstOrDefaultAsync(x => x.Id == productId && x.IsEnabled, ct);

    // ==============================
    // CREATE ORDER
    // ==============================

    public async Task AddOrderAsync(Order order, CancellationToken ct)
        => await _db.Orders.AddAsync(order, ct);

    public async Task AddOrderItemAsync(OrderItem item, CancellationToken ct)
        => await _db.OrderItems.AddAsync(item, ct);

    // ==============================
    // MARK PAID SUPPORT
    // ==============================

    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.Orders
              .FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task UpdateAsync(Order order, CancellationToken ct)
    {
        _db.Orders.Update(order);
        return Task.CompletedTask;
    }

    // ==============================
    // SAVE
    // ==============================

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
