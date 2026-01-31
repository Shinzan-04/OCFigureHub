using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IJwtTokenService
{
    string Generate(User user);
}
