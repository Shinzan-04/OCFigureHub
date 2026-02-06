using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.DTOs.Payments
{
    public class VNPayCallbackResultDto
    {
        public bool Success { get; set; }
        public Guid? OrderId { get; set; }
        public string Message { get; set; } = "";
        public string? PaymentRef { get; set; }
    }
}
