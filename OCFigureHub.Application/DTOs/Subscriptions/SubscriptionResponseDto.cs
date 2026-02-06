using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.DTOs.Subscriptions
{
    public class SubscriptionResponseDto
    {
        public Guid SubscriptionId { get; set; }
        public Guid PlanId { get; set; }
        public DateTime StartAtUtc { get; set; }
        public DateTime EndAtUtc { get; set; }
        public bool IsActive { get; set; }
    }
}
