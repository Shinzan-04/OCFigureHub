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
        if (!db.Users.Any(u => u.Email == "admin@ocfigurehub.com"))
        {
            db.Users.Add(new User
            {
                Email = "admin@ocfigurehub.com",
                DisplayName = "Admin",
                Role = Role.Admin,
                PasswordHash = HashPassword("Admin@123"),
                Status = UserStatus.Active
            });
        }

        // Seed subscription plans
        if (!db.SubscriptionPlans.Any())
        {
            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    Name = "Basic",
                    MonthlyPrice = 99_000m,
                    MonthlyQuotaDownloads = 10,
                    IsEnabled = true
                },
                new SubscriptionPlan
                {
                    Name = "Premium",
                    MonthlyPrice = 249_000m,
                    MonthlyQuotaDownloads = 50,
                    IsEnabled = true
                }
            );
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
