using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Reports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Services
{
    public class ReportService
    {
        private readonly IReportRepository _repo;

        public ReportService(IReportRepository repo)
        {
            _repo = repo;
        }

        public async Task<SalesReportResponseDto> GetSalesAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct)
        {
            var (revenue, paidOrders) = await _repo.GetSalesAsync(fromUtc, toUtc, ct);

            return new SalesReportResponseDto
            {
                FromUtc = fromUtc,
                ToUtc = toUtc,
                TotalRevenue = revenue,
                TotalPaidOrders = paidOrders
            };
        }

        public async Task<DownloadsReportResponseDto> GetDownloadsAsync(DateTime fromUtc, DateTime toUtc, CancellationToken ct)
        {
            var (success, fail, uniqueUsers) = await _repo.GetDownloadsAsync(fromUtc, toUtc, ct);

            return new DownloadsReportResponseDto
            {
                FromUtc = fromUtc,
                ToUtc = toUtc,
                TotalDownloadsSuccess = success,
                TotalDownloadsFail = fail,
                UniqueUsers = uniqueUsers
            };
        }
    }
}
