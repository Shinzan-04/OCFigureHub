using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IPaymentTransactionRepository
{
    Task<PaymentTransaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<PaymentTransaction?> GetByProviderTxnIdAsync(string providerTxnId, CancellationToken ct);
    Task AddAsync(PaymentTransaction txn, CancellationToken ct);
    Task UpdateAsync(PaymentTransaction txn, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
