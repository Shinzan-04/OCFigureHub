using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Auth;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using Google.Apis.Auth;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace OCFigureHub.Application.Services;

public class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IEmailService _email;
    private readonly IConfiguration _config;
    private readonly ISiteSettingRepository _settings;

    public AuthService(
        IUserRepository users, 
        IPasswordHasher hasher, 
        IJwtTokenService jwt,
        IEmailService email,
        IConfiguration config,
        ISiteSettingRepository settings)
    {
        _users = users;
        _hasher = hasher;
        _jwt = jwt;
        _email = email;
        _config = config;
        _settings = settings;
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest req, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(req.Email.Trim().ToLower(), ct);
        if (user == null) return; // Silent success to prevent email enumeration

        var token = _jwt.GenerateResetToken(user);
        
        // Ensure this URL matches your frontend config
        var resetLink = $"http://localhost:5173/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

        await _email.SendPasswordResetEmailAsync(user.Email, resetLink, ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest req, CancellationToken ct)
    {
        var userId = _jwt.ValidateResetToken(req.Token);
        if (userId == null) throw new Exception("Invalid or expired reset token.");

        var user = await _users.GetByIdAsync(userId.Value, ct);
        if (user == null || user.Email.ToLower() != req.Email.ToLower()) 
            throw new Exception("Invalid request.");

        var requireStrongPwd = await _settings.GetValueAsync("security", "requireStrongPassword", ct);
        if (requireStrongPwd == "true")
        {
            var regex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
            if (!regex.IsMatch(req.NewPassword))
            {
                throw new Exception("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
            }
        }

        user.PasswordHash = _hasher.Hash(req.NewPassword);
        
        await _users.SaveChangesAsync(ct);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, bool allowRegistration = true, CancellationToken ct = default)
    {
        if (!allowRegistration) throw new Exception("Registration is currently disabled.");
        
        var exists = await _users.GetByEmailAsync(req.Email, ct);
        if (exists != null) throw new Exception("Email already exists");

        var requireStrongPwd = await _settings.GetValueAsync("security", "requireStrongPassword", ct);
        if (requireStrongPwd == "true")
        {
            var regex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
            if (!regex.IsMatch(req.Password))
            {
                throw new Exception("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
            }
        }

        var verificationToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email.Trim().ToLower(),
            DisplayName = req.DisplayName.Trim(),
            Role = req.Role,
            PasswordHash = _hasher.Hash(req.Password),
            IsEmailVerified = false,
            VerificationToken = verificationToken,
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
        };

        await _users.AddAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        // Send verification email (best-effort, don't block registration)
        try
        {
            var verifyLink = $"http://localhost:5173/verify-email?token={verificationToken}&email={Uri.EscapeDataString(user.Email)}";
            await _email.SendVerificationEmailAsync(user.Email, verifyLink, ct);
        }
        catch { /* log but don't fail registration */ }

        // Send admin notification (best-effort)
        try
        {
            var notify = await _settings.GetValueAsync("notifications", "newUserEmail", ct);
            if (notify == "true")
            {
                var body = $"<p>A new user has registered.</p><p>Email: {user.Email}</p><p>Name: {user.DisplayName}</p>";
                await _email.SendAdminNotificationAsync("New User Signup - OC Figure Hub", body, ct);
            }
        }
        catch { /* log */ }

        var token = await _jwt.GenerateAsync(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            IsEmailVerified = false,
            RequiresVerification = true
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(req.Email.Trim().ToLower(), ct);
        if (user == null) throw new Exception("Invalid credentials");

        if (!_hasher.Verify(req.Password, user.PasswordHash))
            throw new Exception("Invalid credentials");

        // Check email verification setting
        var requireVerify = await _settings.GetValueAsync("security", "requireEmailVerification", ct);
        if (requireVerify == "true" && !user.IsEmailVerified)
        {
            throw new Exception("Vui lòng xác thực email trước khi đăng nhập.");
        }

        var token = await _jwt.GenerateAsync(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            IsEmailVerified = user.IsEmailVerified,
            RequiresVerification = !user.IsEmailVerified
        };
    }

    public async Task<bool> VerifyEmailAsync(string email, string verificationToken, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(email.Trim().ToLower(), ct);
        if (user == null) return false;
        if (user.IsEmailVerified) return true; // already verified
        if (user.VerificationToken != verificationToken) return false;
        if (user.VerificationTokenExpiry < DateTime.UtcNow) return false;

        user.IsEmailVerified = true;
        user.VerificationToken = null;
        user.VerificationTokenExpiry = null;
        await _users.SaveChangesAsync(ct);
        return true;
    }

    public async Task ResendVerificationAsync(string email, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(email.Trim().ToLower(), ct);
        if (user == null) return; // silent
        if (user.IsEmailVerified) return;

        var newToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        user.VerificationToken = newToken;
        user.VerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        await _users.SaveChangesAsync(ct);

        var verifyLink = $"http://localhost:5173/verify-email?token={newToken}&email={Uri.EscapeDataString(user.Email)}";
        await _email.SendVerificationEmailAsync(user.Email, verifyLink, ct);
    }

    public async Task<AuthResponse> LoginWithGoogleAsync(GoogleAuthRequest req, bool allowRegistration = true, CancellationToken ct = default)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _config["Google:ClientId"] }
            };
            payload = await GoogleJsonWebSignature.ValidateAsync(req.Credential, settings);
        }
        catch (InvalidJwtException)
        {
            throw new Exception("Invalid Google token");
        }

        var email = payload.Email.Trim().ToLower();
        var user = await _users.GetByEmailAsync(email, ct);

        if (user == null)
        {
            if (!allowRegistration) throw new Exception("Registration is currently disabled.");
            
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                DisplayName = payload.Name ?? "Google User",
                Role = Role.Customer,
                PasswordHash = _hasher.Hash(Guid.NewGuid().ToString()),
                IsEmailVerified = true // Google already verified email
            };

            await _users.AddAsync(user, ct);
            await _users.SaveChangesAsync(ct);

            // Send admin notification (best-effort)
            try
            {
                var notify = await _settings.GetValueAsync("notifications", "newUserEmail", ct);
                if (notify == "true")
                {
                    var body = $"<p>A new user has registered via Google.</p><p>Email: {user.Email}</p><p>Name: {user.DisplayName}</p>";
                    await _email.SendAdminNotificationAsync("New User Signup - OC Figure Hub", body, ct);
                }
            }
            catch { /* log */ }
        }

        var token = await _jwt.GenerateAsync(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            IsEmailVerified = user.IsEmailVerified
        };
    }

    public async Task<AuthResponse> LoginWithFacebookAsync(FacebookAuthRequest req, bool allowRegistration = true, CancellationToken ct = default)
    {
        var url = $"https://graph.facebook.com/me?fields=id,name,email&access_token={req.AccessToken}";
        using var client = new HttpClient();
        var response = await client.GetAsync(url, ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Invalid Facebook token");
        }

        var content = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        string? email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
        string? name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : "Facebook User";
        string id = root.GetProperty("id").GetString()!;

        if (string.IsNullOrEmpty(email))
        {
            // Fallback to a dummy email based on FB ID if user didn't grant email permission
            email = $"{id}@facebook.ocfigurehub.com";
        }
        
        email = email.Trim().ToLower();

        var user = await _users.GetByEmailAsync(email, ct);

        if (user == null)
        {
            if (!allowRegistration) throw new Exception("Registration is currently disabled.");
            
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                DisplayName = name ?? "Facebook User",
                Role = Role.Customer,
                PasswordHash = _hasher.Hash(Guid.NewGuid().ToString())
            };

            await _users.AddAsync(user, ct);
            await _users.SaveChangesAsync(ct);

            // Send admin notification (best-effort)
            try
            {
                var notify = await _settings.GetValueAsync("notifications", "newUserEmail", ct);
                if (notify == "true")
                {
                    var body = $"<p>A new user has registered via Facebook.</p><p>Email: {user.Email}</p><p>Name: {user.DisplayName}</p>";
                    await _email.SendAdminNotificationAsync("New User Signup - OC Figure Hub", body, ct);
                }
            }
            catch { /* log */ }
        }

        var token = await _jwt.GenerateAsync(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }
}
