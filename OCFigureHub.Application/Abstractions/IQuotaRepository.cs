using OCFigureHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions
{
    public interface IQuotaRepository
    {
        Task<QuotaUsage?> GetByUserAndMonthAsync(Guid userId, string yearMonth, CancellationToken ct);
        Task AddAsync(QuotaUsage quota, CancellationToken ct);
        Task UpdateAsync(QuotaUsage quota, CancellationToken ct);

        // Reset job
        Task ResetMonthlyAsync(string yearMonth, CancellationToken ct);
    }
}
