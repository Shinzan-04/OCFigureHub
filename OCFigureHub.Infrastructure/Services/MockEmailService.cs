using OCFigureHub.Application.Abstractions;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace OCFigureHub.Infrastructure.Services;

public class MockEmailService : IEmailService
{
    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        Console.WriteLine("======================================================");
        Console.WriteLine($"MOCK EMAIL SENT TO: {toEmail}");
        Console.WriteLine($"SUBJECT: Password Reset Request");
        Console.WriteLine($"BODY: Please click the following link to reset your password:\n{resetLink}");
        Console.WriteLine("======================================================");
        return Task.CompletedTask;
    }

    public Task SendVerificationEmailAsync(string toEmail, string verificationLink, CancellationToken ct = default)
    {
        Console.WriteLine("======================================================");
        Console.WriteLine($"MOCK EMAIL SENT TO: {toEmail}");
        Console.WriteLine($"SUBJECT: Email Verification");
        Console.WriteLine($"BODY: Please click the following link to verify your email:\n{verificationLink}");
        Console.WriteLine("======================================================");
        return Task.CompletedTask;
    }
}
