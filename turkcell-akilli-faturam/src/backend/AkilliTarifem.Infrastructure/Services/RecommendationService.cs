using AkilliTarifem.Application.DTOs;
using AkilliTarifem.Application.Interfaces;
using AkilliTarifem.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TurkcellSmartTariff.Application.Interfaces;

namespace AkilliTarifem.Infrastructure.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUsageService _usageService;

        public RecommendationService(IUnitOfWork unitOfWork, IMapper mapper, IUsageService usageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _usageService = usageService;
        }

        public async Task<Result<RecommendationResponseDto>> GetRecommendationsAsync(
            RecommendationRequestDto request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetWithPlanAsync(request.UserId, cancellationToken);
                if (user == null)
                    return Result<RecommendationResponseDto>.Failure("Kullanıcı bulunamadı.");

                // Son 30 günlük kullanım ortalamasını al
                var usageSummaryResult = await _usageService.GetUsageSummaryAsync(request.UserId, 30, cancellationToken);
                if (!usageSummaryResult.IsSuccess)
                    return Result<RecommendationResponseDto>.Failure(usageSummaryResult.ErrorMessage);

                var usageSummary = usageSummaryResult.Data!;

                // Tüm aktif planları getir
                var allPlans = await _unitOfWork.Plans.GetAllAsync(p => p.IsActive, cancellationToken);
                var userTypePlans = allPlans.Where(p => p.Type == user.Type).ToList();

                var recommendations = new List<PlanRecommendationDto>();

                foreach (var plan in userTypePlans)
                {
                    var costResult = await CalculatePlanCostForUsageAsync(plan.Id, usageSummary, cancellationToken);
                    if (costResult.IsSuccess)
                    {
                        var currentPlanCost = await CalculatePlanCostForUsageAsync(user.CurrentPlanId, usageSummary, cancellationToken);
                        var savingsAmount = currentPlanCost.IsSuccess ? currentPlanCost.Data! - costResult.Data! : 0;
                        var savingsPercentage = currentPlanCost.IsSuccess && currentPlanCost.Data > 0
                            ? (savingsAmount / currentPlanCost.Data!) * 100 : 0;

                        recommendations.Add(new PlanRecommendationDto
                        {
                            PlanId = plan.Id,
                            PlanName = plan.PlanName,
                            TotalCost = costResult.Data!,
                            Breakdown = await GetCostBreakdownAsync(plan.Id, usageSummary),
                            SavingsAmount = savingsAmount,
                            SavingsPercentage = savingsPercentage
                        });
                    }
                }

                var top3 = recommendations
                    .OrderBy(r => r.TotalCost)
                    .Take(3)
                    .ToList();

                var rationale = GenerateRationale(usageSummary, top3);

                var response = new RecommendationResponseDto
                {
                    UserId = request.UserId,
                    Top3 = top3,
                    Rationale = rationale
                };

                return Result<RecommendationResponseDto>.Success(response);
            }
            catch (Exception ex)
            {
                return Result<RecommendationResponseDto>.Failure($"Öneri hesaplanırken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<decimal>> CalculatePlanCostAsync(int userId, int planId, CancellationToken cancellationToken = default)
        {
            try
            {
                var usageSummaryResult = await _usageService.GetUsageSummaryAsync(userId, 30, cancellationToken);
                if (!usageSummaryResult.IsSuccess)
                    return Result<decimal>.Failure(usageSummaryResult.ErrorMessage);

                return await CalculatePlanCostForUsageAsync(planId, usageSummaryResult.Data!, cancellationToken);
            }
            catch (Exception ex)
            {
                return Result<decimal>.Failure($"Plan maliyeti hesaplanırken hata oluştu: {ex.Message}");
            }
        }

        private async Task<Result<decimal>> CalculatePlanCostForUsageAsync(
            int planId,
            UsageSummaryDto usageSummary,
            CancellationToken cancellationToken = default)
        {
            var plan = await _unitOfWork.Plans.GetByIdAsync(planId, cancellationToken);
            if (plan == null)
                return Result<decimal>.Failure("Plan bulunamadı.");

            var avgGb = usageSummary.AvgDailyGb * 30; // Aylık tahmin
            var avgMinutes = usageSummary.AvgDailyMinutes * 30;
            var avgSms = usageSummary.AvgDailySms * 30;

            var baseCost = plan.MonthlyPrice;
            var overageGb = Math.Max(avgGb - plan.QuotaGb, 0) * plan.OverageGb;
            var overageMin = Math.Max(avgMinutes - plan.QuotaMin, 0) * plan.OverageMin;
            var overageSms = Math.Max(avgSms - plan.QuotaSms, 0) * plan.OverageSms;

            var totalCost = baseCost + overageGb + overageMin + overageSms;
            return Result<decimal>.Success(totalCost);
        }

        private async Task<CostBredownDto> GetCostBreakdownAsync(int planId, UsageSummaryDto usageSummary)
        {
            var plan = await _unitOfWork.Plans.GetByIdAsync(planId);
            if (plan == null) return new CostBredownDto();

            var avgGb = usageSummary.AvgDailyGb * 30;
            var avgMinutes = usageSummary.AvgDailyMinutes * 30;
            var avgSms = usageSummary.AvgDailySms * 30;

            return new CostBredownDto
            {
                Base = plan.MonthlyPrice,
                OverGb = Math.Max(avgGb - plan.QuotaGb, 0) * plan.OverageGb,
                OverMin = Math.Max(avgMinutes - plan.QuotaMin, 0) * plan.OverageMin,
                OverSms = Math.Max(avgSms - plan.QuotaSms, 0) * plan.OverageSms
            };
        }

        private string GenerateRationale(UsageSummaryDto usageSummary, List<PlanRecommendationDto> top3)
        {
            var avgGb = usageSummary.AvgDailyGb * 30;
            var bestPlan = top3.FirstOrDefault();

            if (bestPlan == null)
                return "Uygun plan bulunamadı.";

            return $"Son 30 günlük ortalama {avgGb:F1}GB kullanım. En uygun plan {bestPlan.PlanName} " +
                   $"ile aylık {bestPlan.TotalCost:F2}TL toplam maliyet öngörülüyor.";
        }

        public async Task<Result<List<AddOnPackDto>>> GetOptimalAddOnPacksAsync(int userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetWithPlanAsync(userId, cancellationToken);
                if (user == null)
                    return Result<List<AddOnPackDto>>.Failure("Kullanıcı bulunamadı.");

                var usageSummaryResult = await _usageService.GetUsageSummaryAsync(userId, 30, cancellationToken);
                if (!usageSummaryResult.IsSuccess)
                    return Result<List<AddOnPackDto>>.Failure(usageSummaryResult.ErrorMessage);

                var usageSummary = usageSummaryResult.Data!;
                var avgGb = usageSummary.AvgDailyGb * 30;

                // Sadece veri aşımı varsa ek paket öner
                if (avgGb <= user.CurrentPlan.QuotaGb)
                    return Result<List<AddOnPackDto>>.Success(new List<AddOnPackDto>());

                var overageGb = avgGb - user.CurrentPlan.QuotaGb;
                var addOnPacks = await _unitOfWork.AddOnPacks.GetAllAsync(p => p.IsActive && p.Type == AddOnType.Data, cancellationToken);

                var optimalPacks = addOnPacks
                    .Where(p => p.ExtraGb >= overageGb)
                    .OrderBy(p => p.Price)
                    .Take(3)
                    .ToList();

                var addOnDtos = _mapper.Map<List<AddOnPackDto>>(optimalPacks);
                return Result<List<AddOnPackDto>>.Success(addOnDtos);
            }
            catch (Exception ex)
            {
                return Result<List<AddOnPackDto>>.Failure($"Ek paket önerisi hesaplanırken hata oluştu: {ex.Message}");
            }
        }
    }
}
