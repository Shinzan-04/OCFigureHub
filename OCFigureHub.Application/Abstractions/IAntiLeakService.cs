using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Abstractions;

public interface IAntiLeakService
{
    /// <summary>
    /// Check if user exceeds rate limit for downloads. Throws if exceeded.
    /// </summary>
    Task CheckRateLimitAsync(Guid userId, CancellationToken ct);

    /// <summary>
    /// Record watermark metadata for a download
    /// </summary>
    Task<string> RecordWatermarkAsync(Guid userId, Guid productId, Guid? downloadTokenId, CancellationToken ct);
}
