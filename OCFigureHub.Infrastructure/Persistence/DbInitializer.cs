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

        // Seed products with mix of Personal and Commercial licenses
        if (!db.Products.Any())
        {
            Console.WriteLine("Seed: Creating sample products...");
            var products = new List<Product>
            {
                new Product { Id = Guid.NewGuid(), Name = "Samurai Warrior Figure", Description = "Detailed samurai warrior model for 3D printing", Price = 150000, Category = "Anime", Creator = "Creator A", IsPro = false, IsEnabled = true, Tags = "samurai,warrior,anime", License = LicenseType.Personal },
                new Product { Id = Guid.NewGuid(), Name = "Dragon Monster Model", Description = "Epic dragon creature with detailed scales", Price = 200000, Category = "Monster", Creator = "Creator B", IsPro = false, IsEnabled = true, Tags = "dragon,monster,fantasy", License = LicenseType.Commercial },
                new Product { Id = Guid.NewGuid(), Name = "Chibi Character Set", Description = "Cute chibi character collection", Price = 0, Category = "Chibi", Creator = "Creator C", IsPro = false, IsEnabled = true, Tags = "chibi,cute,anime", License = LicenseType.Personal },
                new Product { Id = Guid.NewGuid(), Name = "Mecha Robot Kit", Description = "Advanced mecha robot parts", Price = 250000, Category = "Robot", Creator = "Creator D", IsPro = true, IsEnabled = true, Tags = "mecha,robot,sci-fi", License = LicenseType.Commercial },
                new Product { Id = Guid.NewGuid(), Name = "Fantasy Weapon Pack", Description = "Collection of fantasy weapons", Price = 100000, Category = "Weapon", Creator = "Creator E", IsPro = false, IsEnabled = true, Tags = "weapon,fantasy,sword", License = LicenseType.Personal },
                new Product { Id = Guid.NewGuid(), Name = "Game Character Model", Description = "High-poly game character", Price = 180000, Category = "Game", Creator = "Creator F", IsPro = true, IsEnabled = true, Tags = "game,character,3d", License = LicenseType.Commercial },
                new Product { Id = Guid.NewGuid(), Name = "Anime Girl Figure", Description = "Beautiful anime girl figure", Price = 120000, Category = "Figure", Creator = "Creator G", IsPro = false, IsEnabled = true, Tags = "anime,girl,figure", License = LicenseType.Personal },
                new Product { Id = Guid.NewGuid(), Name = "Accessory Pack Vol.1", Description = "Various accessories for figures", Price = 50000, Category = "Accessory", Creator = "Creator H", IsPro = false, IsEnabled = true, Tags = "accessory,parts", License = LicenseType.Personal },
                new Product { Id = Guid.NewGuid(), Name = "Commercial Dragon Set", Description = "Professional dragon model set", Price = 300000, Category = "Monster", Creator = "Creator I", IsPro = true, IsEnabled = true, Tags = "dragon,commercial,pro", License = LicenseType.Commercial },
                new Product { Id = Guid.NewGuid(), Name = "Free Starter Pack", Description = "Free starter pack for beginners", Price = 0, Category = "Figure", Creator = "Creator J", IsPro = false, IsEnabled = true, Tags = "free,starter,beginner", License = LicenseType.Personal }
            };
            db.Products.AddRange(products);
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
