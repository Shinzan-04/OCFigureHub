using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class PaymentTransactionRepository : IPaymentTransactionRepository
{
    private readonly AppDbContext _db;

    public PaymentTransactionRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<PaymentTransaction?> GetByIdAsync(Guid id, CancellationToken ct)
        => _db.PaymentTransactions.FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<PaymentTransaction?> GetByProviderTxnIdAsync(string providerTxnId, CancellationToken ct)
        => _db.PaymentTransactions.FirstOrDefaultAsync(x => x.ProviderTxnId == providerTxnId, ct);

    public async Task AddAsync(PaymentTransaction txn, CancellationToken ct)
        => await _db.PaymentTransactions.AddAsync(txn, ct);

    public Task UpdateAsync(PaymentTransaction txn, CancellationToken ct)
    {
        _db.PaymentTransactions.Update(txn);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct)
        => _db.SaveChangesAsync(ct);
}
