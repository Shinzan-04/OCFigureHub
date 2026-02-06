using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Infrastructure.Repositories
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly AppDbContext _db;

        public SubscriptionRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<Subscription?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct)
        {
            return await _db.Subscriptions
                .Include(x => x.Plan)
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.IsActive &&
                    x.EndAt > DateTime.UtcNow,
                    ct);
        }

        public async Task<List<Subscription>> GetExpiredAsync(DateTime utcNow, CancellationToken ct)
        {
            return await _db.Subscriptions
                .Where(x => x.IsActive && x.EndAt <= utcNow)
                .ToListAsync(ct);
        }

        public async Task AddAsync(Subscription sub, CancellationToken ct)
        {
            _db.Subscriptions.Add(sub);
            await _db.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(Subscription sub, CancellationToken ct)
        {
            _db.Subscriptions.Update(sub);
            await _db.SaveChangesAsync(ct);
        }
    }
}
