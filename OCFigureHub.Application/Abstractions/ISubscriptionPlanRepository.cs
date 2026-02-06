using OCFigureHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions
{
    public interface ISubscriptionPlanRepository
    {
        Task<List<SubscriptionPlan>> GetAllAsync(CancellationToken ct);

        Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken ct);

        Task AddAsync(SubscriptionPlan plan, CancellationToken ct);

        Task UpdateAsync(SubscriptionPlan plan, CancellationToken ct);

        Task DeleteAsync(Guid id, CancellationToken ct);
        Task<SubscriptionPlan?> GetEnabledByIdAsync(Guid id, CancellationToken ct);

    }

}
