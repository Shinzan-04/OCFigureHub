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
    public class SubscriptionPlanRepository : ISubscriptionPlanRepository
    {
        private readonly AppDbContext _db;

        public SubscriptionPlanRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<SubscriptionPlan>> GetAllAsync(CancellationToken ct)
        {
            return await _db.SubscriptionPlans
                .Where(x => x.IsEnabled)
                .ToListAsync(ct);
        }

        public async Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await _db.SubscriptionPlans
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task AddAsync(SubscriptionPlan plan, CancellationToken ct)
        {
            _db.SubscriptionPlans.Add(plan);
            await _db.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(SubscriptionPlan plan, CancellationToken ct)
        {
            _db.SubscriptionPlans.Update(plan);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Guid id, CancellationToken ct)
        {
            var plan = await _db.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (plan != null)
            {
                _db.SubscriptionPlans.Remove(plan);
                await _db.SaveChangesAsync(ct);
            }
        }
        public async Task<SubscriptionPlan?> GetEnabledByIdAsync(Guid id, CancellationToken ct)
        {
            return await _db.SubscriptionPlans
                .FirstOrDefaultAsync(x => x.Id == id && x.IsEnabled, ct);
        }

    }
}
