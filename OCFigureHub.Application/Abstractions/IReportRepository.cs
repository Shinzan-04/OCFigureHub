using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions
{
    public interface IReportRepository
    {
        Task<(decimal revenue, int paidOrders)> GetSalesAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct);
        Task<(int success, int fail, int uniqueUsers)> GetDownloadsAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct);
    }
}
