using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Infrastructure.Payments
{
    public class VNPayOptions
    {
        public string TmnCode { get; set; } = "";
        public string HashSecret { get; set; } = "";
        public string BaseUrl { get; set; } = "";
        public string ReturnUrl { get; set; } = "";
        public string IpnUrl { get; set; } = "";
    }
}
