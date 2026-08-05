using System.Threading;
using System.Threading.Tasks;

namespace OCFigureHub.Application.Abstractions;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default);
    Task SendVerificationEmailAsync(string toEmail, string verificationLink, CancellationToken ct = default);
    Task SendAdminNotificationAsync(string subject, string body, CancellationToken ct = default);
}
