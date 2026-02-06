using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.DTOs.Reports
{
    public class SalesReportResponseDto
    {
        public DateTime FromUtc { get; set; }
        public DateTime ToUtc { get; set; }

        public decimal TotalRevenue { get; set; }
        public int TotalPaidOrders { get; set; }
    }
}
