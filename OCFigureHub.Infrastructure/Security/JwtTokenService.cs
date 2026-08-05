using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Domain.Entities;
using OCFigureHub.Infrastructure.Persistence;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OCFigureHub.Infrastructure.Security;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _cfg;
    private readonly IServiceScopeFactory _scopeFactory;

    public JwtTokenService(IConfiguration cfg, IServiceScopeFactory scopeFactory)
    {
        _cfg = cfg;
        _scopeFactory = scopeFactory;
    }

    public async Task<string> GenerateAsync(User user)
    {
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];
        var key = _cfg["Jwt:Key"];
        
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var sessionTimeoutStr = await db.SiteSettings
            .Where(s => s.Group == "security" && s.Key == "sessionTimeout")
            .Select(s => s.Value)
            .FirstOrDefaultAsync();

        var expireMinutes = int.TryParse(sessionTimeoutStr, out int hours) ? hours * 60 : int.Parse(_cfg["Jwt:ExpireMinutes"] ?? "120");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("displayName", user.DisplayName)
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expireMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateResetToken(User user)
    {
        var key = _cfg["Jwt:Key"];
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("reset", "true")
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15), // 15 mins expiry for reset tokens
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Guid? ValidateResetToken(string token)
    {
        try
        {
            var key = _cfg["Jwt:Key"];
            var issuer = _cfg["Jwt:Issuer"];
            var audience = _cfg["Jwt:Audience"];

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            var jwtToken = (JwtSecurityToken)validatedToken;

            var isReset = principal.FindFirst("reset")?.Value == "true";
            if (!isReset) return null;

            var userIdString = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdString, out Guid userId))
            {
                return userId;
            }

            return null;
        }
        catch
        {
            return null; // Invalid token
        }
    }
}
