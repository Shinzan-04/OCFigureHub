using Microsoft.EntityFrameworkCore;
using OCFigureHub.Application.Abstractions;
using OCFigureHub.Infrastructure.Persistence;

namespace OCFigureHub.Infrastructure.Repositories;

public class SiteSettingRepository : ISiteSettingRepository
{
    private readonly AppDbContext _db;

    public SiteSettingRepository(AppDbContext db) => _db = db;

    public async Task<string?> GetValueAsync(string group, string key, CancellationToken ct = default)
    {
        var setting = await _db.SiteSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Group == group && s.Key == key, ct);
        return setting?.Value;
    }
}
