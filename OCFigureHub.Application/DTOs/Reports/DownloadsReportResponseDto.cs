using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.DTOs.Reports
{
    public class DownloadsReportResponseDto
    {
        public DateTime FromUtc { get; set; }
        public DateTime ToUtc { get; set; }

        public int TotalDownloadsSuccess { get; set; }
        public int TotalDownloadsFail { get; set; }
        public int UniqueUsers { get; set; }
    }
}
