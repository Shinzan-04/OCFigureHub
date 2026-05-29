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
<<<<<<< Updated upstream
=======

    // ==============================
    // ADMIN: LIST ALL ORDERS
    // ==============================

    public async Task<List<Order>> GetAllOrdersAsync(int page, int pageSize, CancellationToken ct)
        => await _db.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .Include(o => o.Plan)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

    public Task<int> GetOrderCountAsync(CancellationToken ct)
        => _db.Orders.CountAsync(ct);

    public Task<int> GetUserOrderCountAsync(Guid userId, CancellationToken ct)
        => _db.Orders.CountAsync(o => o.UserId == userId, ct);
>>>>>>> Stashed changes
}
