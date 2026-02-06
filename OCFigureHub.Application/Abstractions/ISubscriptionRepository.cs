using OCFigureHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions
{
    public interface ISubscriptionRepository
    {
        Task<Subscription?> GetActiveByUserIdAsync(Guid userId, CancellationToken ct);
        Task AddAsync(Subscription sub, CancellationToken ct);
        Task UpdateAsync(Subscription sub, CancellationToken ct);
        Task<List<Subscription>> GetExpiredAsync(DateTime utcNow, CancellationToken ct);

    }
}
