using Microsoft.Extensions.Configuration;
using OCFigureHub.Application.Abstractions;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

namespace OCFigureHub.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        var host = _config["EmailSettings:SmtpHost"];
        var portStr = _config["EmailSettings:SmtpPort"];
        var user = _config["EmailSettings:SmtpUser"];
        var pass = _config["EmailSettings:SmtpPass"];
        var from = _config["EmailSettings:FromEmail"];

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
        {
            throw new System.Exception("Email settings are not configured properly in appsettings.json.");
        }

        int port = int.TryParse(portStr, out var p) ? p : 587;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(from ?? user, "OC Figure Hub"),
            Subject = "Khôi phục mật khẩu - OC Figure Hub",
            Body = $@"
                <h3>Yêu cầu khôi phục mật khẩu</h3>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản OC Figure Hub.</p>
                <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
                <p><a href='{resetLink}'>{resetLink}</a></p>
                <br/>
                <p>Link này sẽ hết hạn sau 15 phút.</p>
                <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            ",
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage, ct);
    }

    public async Task SendVerificationEmailAsync(string toEmail, string verificationLink, CancellationToken ct = default)
    {
        var host = _config["EmailSettings:SmtpHost"];
        var portStr = _config["EmailSettings:SmtpPort"];
        var user = _config["EmailSettings:SmtpUser"];
        var pass = _config["EmailSettings:SmtpPass"];
        var from = _config["EmailSettings:FromEmail"];

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(pass))
        {
            throw new System.Exception("Email settings are not configured properly in appsettings.json.");
        }

        int port = int.TryParse(portStr, out var p) ? p : 587;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(from ?? user, "OC Figure Hub"),
            Subject = "Xác thực tài khoản - OC Figure Hub",
            Body = $@"
                <h3>Chào mừng bạn đến với OC Figure Hub!</h3>
                <p>Vui lòng click vào link bên dưới để xác thực email của bạn:</p>
                <p><a href='{verificationLink}'>{verificationLink}</a></p>
                <br/>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
            ",
            IsBodyHtml = true
        };
        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage, ct);
    }
}
