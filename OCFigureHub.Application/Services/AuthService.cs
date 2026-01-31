using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Auth;
using OCFigureHub.Domain.Entities;

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
}
