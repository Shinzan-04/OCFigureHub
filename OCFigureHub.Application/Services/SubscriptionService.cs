using OCFigureHub.Application.Abstractions;
using OCFigureHub.Application.DTOs.Subscriptions;
using OCFigureHub.Domain.Entities;

namespace OCFigureHub.Application.Services
{
    public class SubscriptionService
    {
        private readonly ISubscriptionPlanRepository _plans;
        private readonly ISubscriptionRepository _subs;
        private readonly IQuotaRepository _quotas;

        public SubscriptionService(
            ISubscriptionPlanRepository plans,
            ISubscriptionRepository subs,
            IQuotaRepository quotas)
        {
            _plans = plans;
            _subs = subs;
            _quotas = quotas;
        }

        public async Task<SubscriptionResponseDto> SubscribeAsync(Guid userId, SubscribeRequestDto req, CancellationToken ct)
        {
            var plan = await _plans.GetEnabledByIdAsync(req.PlanId, ct)
                       ?? throw new Exception("Plan not found/disabled");

            var existing = await _subs.GetActiveByUserIdAsync(userId, ct);
            if (existing != null && existing.PlanId == plan.Id)
            {
                // đơn giản: gia hạn tiếp 30 ngày cho gói đang dùng
                existing.EndAt = existing.EndAt.AddDays(30);
                existing.IsActive = true;
                await _subs.UpdateAsync(existing, ct);

                return new SubscriptionResponseDto
                {
                    SubscriptionId = existing.Id,
                    PlanId = existing.PlanId,
                    StartAtUtc = existing.StartAt,
                    EndAtUtc = existing.EndAt,
                    IsActive = existing.IsActive,
                    LimitDownloads = plan.MonthlyQuotaDownloads,
                    RemainingDownloads = plan.MonthlyQuotaDownloads
                };
            }

            // Nếu khác gói hoặc chưa có gói, tạo Subscription mới
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
                IsActive = sub.IsActive,
                LimitDownloads = plan.MonthlyQuotaDownloads,
                RemainingDownloads = plan.MonthlyQuotaDownloads
            };
        }

        public async Task ActivateSubscriptionAsync(Guid userId, Guid planId, CancellationToken ct)
        {
            var plan = await _plans.GetEnabledByIdAsync(planId, ct)
                       ?? throw new Exception("Plan not found/disabled");

            var existing = await _subs.GetActiveByUserIdAsync(userId, ct);
            if (existing != null && existing.PlanId == plan.Id)
            {
                // Gia hạn gói cũ
                existing.EndAt = existing.EndAt.AddDays(30);
                existing.IsActive = true;
                await _subs.UpdateAsync(existing, ct);
            }
            else
            {
                // Nếu nâng cấp gói khác hoặc mua lần đầu, tạo Sub mới
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
            }
        }

        public async Task<SubscriptionResponseDto?> GetCurrentAsync(Guid userId, CancellationToken ct)
        {
            var sub = await _subs.GetActiveByUserIdAsync(userId, ct);
            if (sub == null) return null;

            var plan = await _plans.GetEnabledByIdAsync(sub.PlanId, ct);
            var limit = plan?.MonthlyQuotaDownloads ?? 0;

            var ym = DateTime.UtcNow.AddHours(7).ToString("yyyy-MM");
            var usage = await _quotas.GetByUserAndMonthAsync(userId, ym, ct);

            var used = usage?.UsedDownloads ?? 0;
            var remaining = Math.Max(0, limit - used);

            return new SubscriptionResponseDto
            {
                SubscriptionId = sub.Id,
                PlanId = sub.PlanId,
                StartAtUtc = sub.StartAt,
                EndAtUtc = sub.EndAt,
                IsActive = sub.IsActive,
                LimitDownloads = limit,
                RemainingDownloads = remaining
            };
        }
    }
}
