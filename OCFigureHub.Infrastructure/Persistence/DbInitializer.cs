using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using System.Security.Cryptography;

namespace OCFigureHub.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Seed(AppDbContext db)
    {
        // Seed admin user
        var adminEmail = "admin@ocfigurehub.com";
        var admin = db.Users.FirstOrDefault(u => u.Email == adminEmail);
        
        if (admin == null)
        {
            Console.WriteLine("Seed: Creating admin user...");
            admin = new User { Id = Guid.NewGuid(), Email = adminEmail };
            db.Users.Add(admin);
        }
        else
        {
            Console.WriteLine("Seed: Updating admin user...");
        }

        admin.DisplayName = "Admin";
        admin.Role = Role.Admin;
        admin.PasswordHash = HashPassword("Admin@123");
        admin.Status = UserStatus.Active;

        // Seed subscription plans
        var targetPlans = new List<SubscriptionPlan>
        {
            new SubscriptionPlan { Name = "Free", MonthlyPrice = 0, MonthlyQuotaDownloads = 3, IsEnabled = true },
            new SubscriptionPlan { Name = "Pro", MonthlyPrice = 250_000m, MonthlyQuotaDownloads = 20, IsEnabled = true },
            new SubscriptionPlan { Name = "Ultimate", MonthlyPrice = 620_000m, MonthlyQuotaDownloads = 9999, IsEnabled = true }
        };

        foreach (var p in targetPlans)
        {
            var existing = db.SubscriptionPlans.FirstOrDefault(x => x.Name == p.Name);
            if (existing == null)
            {
                p.Id = Guid.NewGuid();
                db.SubscriptionPlans.Add(p);
            }
            else
            {
                existing.MonthlyPrice = p.MonthlyPrice;
                existing.MonthlyQuotaDownloads = p.MonthlyQuotaDownloads;
                existing.IsEnabled = true;
            }
        }

        // Disable old plans (99k, 249k, etc.) to avoid foreign key errors
        var namesToKeep = targetPlans.Select(x => x.Name).ToList();
        var toDisable = db.SubscriptionPlans.Where(x => !namesToKeep.Contains(x.Name)).ToList();
        foreach (var old in toDisable)
        {
            old.IsEnabled = false;
        }

        db.SaveChanges();
    }

    /// <summary>
    /// Same hash algorithm as Pbkdf2PasswordHasher so the seeded password works with login
    /// </summary>
    private static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        byte[] hash = pbkdf2.GetBytes(32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
}
