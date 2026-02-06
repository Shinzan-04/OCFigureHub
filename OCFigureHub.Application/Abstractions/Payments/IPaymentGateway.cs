using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions.Payments
{
    public interface IPaymentGateway
    {
        Task<string> CreatePaymentUrlAsync(Guid orderId, decimal amount, CancellationToken ct);

        // For Return URL and IPN verification
        bool VerifySignature(IDictionary<string, string> vnpParams);
    }
}
