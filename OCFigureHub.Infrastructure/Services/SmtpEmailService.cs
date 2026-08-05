using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

namespace OCFigureHub.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly IServiceScopeFactory _scopeFactory;

    public SmtpEmailService(IConfiguration config, IServiceScopeFactory scopeFactory)
    {
        _config = config;
        _scopeFactory = scopeFactory;
    }

    private async Task<(string host, int port, string user, string pass, string fromEmail, string fromName)> GetSmtpConfigAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        var settings = await db.SiteSettings
            .Where(s => s.Group == "email")
            .ToDictionaryAsync(s => s.Key, s => s.Value, ct);

        // Fallback to appsettings if DB is not configured yet
        var host = settings.GetValueOrDefault("smtpHost") ?? _config["EmailSettings:SmtpHost"];
        var portStr = settings.GetValueOrDefault("smtpPort") ?? _config["EmailSettings:SmtpPort"];
        var user = settings.GetValueOrDefault("smtpUser") ?? _config["EmailSettings:SmtpUser"];
        var pass = settings.GetValueOrDefault("smtpPassword") ?? _config["EmailSettings:SmtpPass"];
        var fromEmail = settings.GetValueOrDefault("fromEmail") ?? _config["EmailSettings:FromEmail"];
        var fromName = settings.GetValueOrDefault("fromName") ?? "OC Figure Hub";

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
        {
            throw new System.Exception("Email settings are not configured properly in Database or appsettings.json.");
        }

        int port = int.TryParse(portStr, out var p) ? p : 587;
        
        return (host!, port, user!, pass!, fromEmail, fromName);
    }

    private async Task SendMailInternalAsync(string toEmail, string subject, string body, CancellationToken ct)
    {
        var config = await GetSmtpConfigAsync(ct);

        using var client = new SmtpClient(config.host, config.port)
        {
            Credentials = new NetworkCredential(config.user, config.pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(config.fromEmail ?? config.user, config.fromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage, ct);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        var body = $@"
            <h3>Yêu cầu khôi phục mật khẩu</h3>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản OC Figure Hub.</p>
            <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
            <p><a href='{resetLink}'>{resetLink}</a></p>
            <br/>
            <p>Link này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        ";
        
        await SendMailInternalAsync(toEmail, "Khôi phục mật khẩu - OC Figure Hub", body, ct);
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verificationLink, CancellationToken ct = default)
    {
        var body = $@"
            <h3>Chào mừng bạn đến với OC Figure Hub!</h3>
            <p>Vui lòng click vào link bên dưới để xác thực email của bạn:</p>
            <p><a href='{verificationLink}'>{verificationLink}</a></p>
            <br/>
            <p>Link này sẽ hết hạn sau 24 giờ.</p>
            <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        ";
        
        await SendMailInternalAsync(toEmail, "Xác thực tài khoản - OC Figure Hub", body, ct);
    }

    public async Task SendAdminNotificationAsync(string subject, string body, CancellationToken ct = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Find admin email from General Settings or fallback to configured FromEmail
        var generalSettings = await db.SiteSettings
            .Where(s => s.Group == "general")
            .ToDictionaryAsync(s => s.Key, s => s.Value, ct);
            
        var adminEmail = generalSettings.GetValueOrDefault("contactEmail");
        if (string.IsNullOrEmpty(adminEmail))
        {
            var config = await GetSmtpConfigAsync(ct);
            adminEmail = config.fromEmail ?? config.user;
        }

        await SendMailInternalAsync(adminEmail, subject, body, ct);
    }
}
