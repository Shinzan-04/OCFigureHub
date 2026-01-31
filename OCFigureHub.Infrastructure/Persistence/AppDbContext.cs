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

        base.OnModelCreating(modelBuilder);
    }
}
