using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.API.Services;

public class NotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db) => _db = db;

    public async Task CreateAsync(Guid userId, string title, string message, string type = "info", string? link = null, CancellationToken ct = default)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            Link = link,
            IsRead = false
        });
        await _db.SaveChangesAsync(ct);
    }

    public async Task NotifyOrderCreated(Guid userId, decimal amount, string productName, CancellationToken ct = default)
    {
        await CreateAsync(userId,
            "Đơn hàng mới",
            $"Bạn đã đặt mua \"{productName}\" với giá {amount:N0}₫. Vui lòng thanh toán.",
            "order", null, ct);
    }

    public async Task NotifyPaymentSuccess(Guid userId, decimal amount, CancellationToken ct = default)
    {
        await CreateAsync(userId,
            "Thanh toán thành công",
            $"Thanh toán {amount:N0}₫ đã được xác nhận. Cảm ơn bạn!",
            "success", "/download-history", ct);
    }

    public async Task NotifyDownload(Guid userId, string productName, CancellationToken ct = default)
    {
        await CreateAsync(userId,
            "Tải xuống thành công",
            $"Bạn đã tải \"{productName}\". Kiểm tra trong lịch sử tải xuống.",
            "download", "/download-history", ct);
    }

    public async Task NotifySubscription(Guid userId, string planName, CancellationToken ct = default)
    {
        await CreateAsync(userId,
            "Đăng ký thành công",
            $"Bạn đã đăng ký gói \"{planName}\". Tận hưởng quyền lợi ngay!",
            "success", "/settings", ct);
    }

    public async Task NotifyWelcome(Guid userId, string displayName, CancellationToken ct = default)
    {
        await CreateAsync(userId,
            "Chào mừng đến OCFigureHub! 🎉",
            $"Xin chào {displayName}! Khám phá hàng nghìn mô hình 3D chất lượng cao.",
            "info", "/", ct);
    }
}
