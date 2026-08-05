using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IJwtTokenService
{
    Task<string> GenerateAsync(User user);
    string GenerateResetToken(User user);
    Guid? ValidateResetToken(string token);
}
