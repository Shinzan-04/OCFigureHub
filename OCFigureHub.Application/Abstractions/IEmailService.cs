using System.Threading;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default);
}
