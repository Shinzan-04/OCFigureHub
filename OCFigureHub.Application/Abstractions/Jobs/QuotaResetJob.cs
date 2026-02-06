using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions.Jobs
{
    public class QuotaResetJob
    {
        private readonly IQuotaRepository _quota;

        public QuotaResetJob(IQuotaRepository quota)
        {
            _quota = quota;
        }

        public async Task RunMonthlyResetAsync(CancellationToken ct)
        {
            // Reset quota cho tháng hiện tại (yyyy-MM)
            var ym = DateTime.UtcNow.ToString("yyyy-MM");
            await _quota.ResetMonthlyAsync(ym, ct);
        }
    }
}
