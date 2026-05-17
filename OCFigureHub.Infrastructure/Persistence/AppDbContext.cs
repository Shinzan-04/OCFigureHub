using Microsoft.EntityFrameworkCore;
using OCFigureHub.Domain.Entities;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace OCFigureHub.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductFile> ProductFiles => Set<ProductFile>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<QuotaUsage> QuotaUsages => Set<QuotaUsage>();
    public DbSet<DownloadToken> DownloadTokens => Set<DownloadToken>();
    public DbSet<DownloadHistory> DownloadHistories => Set<DownloadHistory>();
    public DbSet<WatermarkInfo> WatermarkInfos => Set<WatermarkInfo>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<ProductFile>()
            .HasOne(x => x.Product)
            .WithMany(x => x.Files)
            .HasForeignKey(x => x.ProductId);

        modelBuilder.Entity<Order>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Order)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.OrderId);

        modelBuilder.Entity<OrderItem>()
            .HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId);

        modelBuilder.Entity<Subscription>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        modelBuilder.Entity<Subscription>()
            .HasOne(x => x.Plan)
            .WithMany()
            .HasForeignKey(x => x.PlanId);

        modelBuilder.Entity<QuotaUsage>()
            .HasIndex(x => new { x.UserId, x.YearMonth })
            .IsUnique();

        modelBuilder.Entity<DownloadHistory>()
            .HasOne<Product>()
            .WithMany(p => p.DownloadHistories)
            .HasForeignKey(dh => dh.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Chat relationships
        modelBuilder.Entity<ChatSession>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ChatSession>()
            .HasIndex(x => x.GuestKey);

        modelBuilder.Entity<ChatMessage>()
            .HasOne(x => x.Session)
            .WithMany(x => x.Messages)
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Precision for decimals
        modelBuilder.Entity<Product>().Property(x => x.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<OrderItem>().Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PaymentTransaction>().Property(x => x.Amount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<SubscriptionPlan>().Property(x => x.MonthlyPrice).HasColumnType("decimal(18,2)");

        base.OnModelCreating(modelBuilder);
    }
}
