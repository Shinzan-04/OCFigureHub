using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Subscriptions;
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Services
{
    public class SubscriptionService
    {
        private readonly ISubscriptionPlanRepository _plans;
        private readonly ISubscriptionRepository _subs;

        public SubscriptionService(
            ISubscriptionPlanRepository plans,
            ISubscriptionRepository subs)
        {
            _plans = plans;
            _subs = subs;
        }

        public async Task<SubscriptionResponseDto> SubscribeAsync(Guid userId, SubscribeRequestDto req, CancellationToken ct)
        {
            var plan = await _plans.GetEnabledByIdAsync(req.PlanId, ct)
                       ?? throw new Exception("Plan not found/disabled");

            var existing = await _subs.GetActiveByUserIdAsync(userId, ct);
            if (existing != null)
            {
                // đơn giản: gia hạn tiếp 30 ngày
                existing.EndAt = existing.EndAt.AddDays(30);
                existing.IsActive = true;
                await _subs.UpdateAsync(existing, ct);

                return new SubscriptionResponseDto
                {
                    SubscriptionId = existing.Id,
                    PlanId = existing.PlanId,
                    StartAtUtc = existing.StartAt,
                    EndAtUtc = existing.EndAt,
                    IsActive = existing.IsActive
                };
            }

            var now = DateTime.UtcNow;

            var sub = new Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanId = plan.Id,
                StartAt = now,
                EndAt = now.AddDays(30),
                IsActive = true
            };

            await _subs.AddAsync(sub, ct);

            return new SubscriptionResponseDto
            {
                SubscriptionId = sub.Id,
                PlanId = sub.PlanId,
                StartAtUtc = sub.StartAt,
                EndAtUtc = sub.EndAt,
                IsActive = sub.IsActive
            };
        }
    }
}
