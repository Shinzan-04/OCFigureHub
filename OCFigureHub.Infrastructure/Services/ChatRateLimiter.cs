using System.Collections.Concurrent;
using OCFigureHub.Application.Services;

namespace OCFigureHub.Infrastructure.Services;

public class InMemoryChatRateLimiter : IChatRateLimiter
{
    private readonly ConcurrentDictionary<string, List<DateTime>> _requests = new();

    public bool IsAllowed(string key, int dailyLimit)
    {
        var now = DateTime.UtcNow.Date;
        var requests = _requests.GetOrAdd(key, _ => new List<DateTime>());

        lock (requests)
        {
            requests.RemoveAll(d => d.Date < now);
            if (requests.Count >= dailyLimit)
            {
                return false;
            }

            requests.Add(DateTime.UtcNow);
            return true;
        }
    }

    public int GetRemaining(string key, int dailyLimit)
    {
        var now = DateTime.UtcNow.Date;
        var requests = _requests.GetOrAdd(key, _ => new List<DateTime>());

        lock (requests)
        {
            requests.RemoveAll(d => d.Date < now);
            return Math.Max(0, dailyLimit - requests.Count);
        }
    }
}
