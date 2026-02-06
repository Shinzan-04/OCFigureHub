using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.DTOs.Payments
{
    public class CreatePaymentResponseDto
    {
        public Guid OrderId { get; set; }
        public string PaymentUrl { get; set; } = "";
    }
}
