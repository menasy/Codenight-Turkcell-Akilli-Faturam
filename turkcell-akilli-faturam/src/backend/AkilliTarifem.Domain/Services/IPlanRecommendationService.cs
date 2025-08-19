using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Domain.Services
{
    /// <summary>
    /// Plan öneri algoritmasý için domain servis interface'i.
    /// Single Responsibility prensibini takip eder.
    /// </summary>
    public interface IPlanRecommendationService
    {
        /// <summary>
        /// Kullanýcýnýn kullaným geçmiþine göre en uygun 3 planý önerir
        /// </summary>
        Task<IEnumerable<PlanRecommendation>> GetTopRecommendationsAsync(User user, IEnumerable<Usage> usageHistory, 
                                                                         IEnumerable<Plan> availablePlans, 
                                                                         CancellationToken cancellationToken = default);

        /// <summary>
        /// Kullaným geçmiþine göre ortalama tüketimi hesaplar
        /// </summary>
        UsageStatistics CalculateUsageStatistics(IEnumerable<Usage> usageHistory, int days = 30);

        /// <summary>
        /// Plan deðiþikliði önerir
        /// </summary>
        Task<PlanChangeRecommendation?> SuggestPlanChangeAsync(User user, IEnumerable<Usage> usageHistory, 
                                                              IEnumerable<Plan> availablePlans,
                                                              CancellationToken cancellationToken = default);

        /// <summary>
        /// Ek paket önerisi yapar
        /// </summary>
        Task<IEnumerable<AddOnPackRecommendation>> SuggestAddOnPacksAsync(User user, Plan currentPlan, 
                                                                          IEnumerable<Usage> usageHistory,
                                                                          IEnumerable<AddOnPack> availableAddOns,
                                                                          CancellationToken cancellationToken = default);
    }

    public class PlanRecommendation
    {
        public Plan Plan { get; set; } = null!;
        public decimal EstimatedMonthlyCost { get; set; }
        public decimal MonthlySavings { get; set; }
        public string Rationale { get; set; } = string.Empty;
        public decimal ConfidenceScore { get; set; }
        public CostBreakdown CostBreakdown { get; set; } = new();
    }

    public class CostBreakdown
    {
        public decimal BaseCost { get; set; }
        public decimal OverageGB { get; set; }
        public decimal OverageMinutes { get; set; }
        public decimal OverageSms { get; set; }
        public decimal TotalCost => BaseCost + OverageGB + OverageMinutes + OverageSms;
    }

    public class UsageStatistics
    {
        public decimal AverageGbUsage { get; set; }
        public decimal AverageMinutesUsage { get; set; }
        public decimal AverageSmsUsage { get; set; }
        public decimal PeakGbUsage { get; set; }
        public decimal PeakMinutesUsage { get; set; }
        public decimal PeakSmsUsage { get; set; }
        public UsageIntensity UsagePattern { get; set; }
        public int DaysAnalyzed { get; set; }
    }

    public class PlanChangeRecommendation
    {
        public Plan RecommendedPlan { get; set; } = null!;
        public decimal EstimatedSavings { get; set; }
        public string Reason { get; set; } = string.Empty;
        public decimal ConfidenceLevel { get; set; }
    }

    public class AddOnPackRecommendation
    {
        public AddOnPack AddOnPack { get; set; } = null!;
        public decimal EstimatedSavings { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Priority { get; set; }
    }
}