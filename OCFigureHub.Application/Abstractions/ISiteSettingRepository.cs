using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface ISiteSettingRepository
{
    Task<string?> GetValueAsync(string group, string key, CancellationToken ct = default);
}
