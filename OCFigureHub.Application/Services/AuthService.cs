using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Auth;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Domain.Enums;
using Google.Apis.Auth;
using System.Text.Json;

namespace OCFigureHub.Application.Services;

public class AuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public AuthService(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _users = users;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct)
    {
        var exists = await _users.GetByEmailAsync(req.Email, ct);
        if (exists != null) throw new Exception("Email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email.Trim().ToLower(),
            DisplayName = req.DisplayName.Trim(),
            Role = req.Role,
            PasswordHash = _hasher.Hash(req.Password),
        };

        await _users.AddAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        var token = _jwt.Generate(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var user = await _users.GetByEmailAsync(req.Email.Trim().ToLower(), ct);
        if (user == null) throw new Exception("Invalid credentials");

        if (!_hasher.Verify(req.Password, user.PasswordHash))
            throw new Exception("Invalid credentials");

        var token = _jwt.Generate(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> LoginWithGoogleAsync(GoogleAuthRequest req, CancellationToken ct)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            // Validate the Google JWT credential
            payload = await GoogleJsonWebSignature.ValidateAsync(req.Credential);
        }
        catch (InvalidJwtException)
        {
            throw new Exception("Invalid Google token");
        }

        var email = payload.Email.Trim().ToLower();
        var user = await _users.GetByEmailAsync(email, ct);

        // If user doesn't exist, create a new one automatically
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                DisplayName = payload.Name ?? "Google User",
                Role = Role.Customer,
                PasswordHash = _hasher.Hash(Guid.NewGuid().ToString()) // random password
            };

            await _users.AddAsync(user, ct);
            await _users.SaveChangesAsync(ct);
        }

        var token = _jwt.Generate(user);

        return new AuthResponse
        {
            AccessToken = token,
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> LoginWithFacebookAsync(FacebookAuthRequest req, CancellationToken ct)
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
        }

        var token = _jwt.Generate(user);

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
