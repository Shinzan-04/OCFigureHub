using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Users;
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Services;

public class UserProfileService
{
    private readonly IUserRepository _users;
    private readonly ISubscriptionRepository _subscriptions;
    private readonly IQuotaRepository _quotas;
    private readonly IStorageService _storage;

    public UserProfileService(
        IUserRepository users,
        ISubscriptionRepository subscriptions,
        IQuotaRepository quotas,
        IStorageService storage)
    {
        _users = users;
        _subscriptions = subscriptions;
        _quotas = quotas;
        _storage = storage;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new Exception("User not found");

        var profile = new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        // Attach VIP info
        var subscription = await _subscriptions.GetActiveByUserIdAsync(userId, ct);
        if (subscription != null)
        {
            var yearMonth = DateTime.UtcNow.ToString("yyyy-MM");
            var quota = await _quotas.GetByUserAndMonthAsync(userId, yearMonth, ct);

            profile.VipInfo = new VipInfoDto
            {
                PlanName = subscription.Plan.Name,
                MonthlyPrice = subscription.Plan.MonthlyPrice,
                MonthlyQuota = subscription.Plan.MonthlyQuotaDownloads,
                DownloadsUsed = quota?.UsedDownloads ?? 0,
                IsActive = subscription.IsActive && subscription.EndAt > DateTime.UtcNow,
                EndAt = subscription.EndAt
            };
        }

        return profile;
    }

    public async Task<UserProfileDto> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest req,
        CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new Exception("User not found");

        user.DisplayName = req.DisplayName.Trim();
        user.Bio = req.Bio?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _users.UpdateAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        return await GetProfileAsync(userId, ct);
    }

    public async Task<UploadAvatarResponse> UploadAvatarAsync(
        Guid userId,
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct)
    {
        // Validate image type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(contentType.ToLowerInvariant()))
            throw new Exception("Only JPEG, PNG, GIF, and WebP images are allowed.");

        // Validate file size (max 5MB)
        if (fileStream.Length > 5 * 1024 * 1024)
            throw new Exception("Image size must be less than 5MB.");

        // Upload to Azure Blob Storage
        var (storageKey, _) = await _storage.UploadAsync(
            fileStream, fileName, contentType, ct);

        // Generate long-lived read SAS URL (365 days)
        var avatarUrl = _storage.GenerateReadSasUrl(storageKey, TimeSpan.FromDays(365));

        // Update user record
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new Exception("User not found");

        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _users.UpdateAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        return new UploadAvatarResponse { AvatarUrl = avatarUrl };
    }
}
