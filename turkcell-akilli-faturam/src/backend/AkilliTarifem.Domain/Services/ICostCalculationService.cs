using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Domain.Services
{
    /// <summary>
    /// Maliyet hesaplama iþlemlerini yöneten domain servis interface'i.
    /// Single Responsibility ve Interface Segregation prensiplerini takip eder.
    /// </summary>
    public interface ICostCalculationService
    {
        /// <summary>
        /// Belirli bir plan için aylýk toplam maliyeti hesaplar
        /// </summary>
        decimal CalculateMonthlyCost(Plan plan, int avgGbUsage, int avgMinutesUsage, int avgSmsUsage);

        /// <summary>
        /// Aþým ücretlerini hesaplar
        /// </summary>
        decimal CalculateOverageCost(Plan plan, int usedGb, int usedMinutes, int usedSms);

        /// <summary>
        /// Ek paket kombinasyonu ile en optimal maliyeti hesaplar
        /// </summary>
        decimal CalculateOptimalCostWithAddOns(Plan plan, IEnumerable<AddOnPack> availableAddOns, 
                                              int avgGbUsage, int avgMinutesUsage, int avgSmsUsage);

        /// <summary>
        /// Kullaným geçmiþine göre ay sonu tahmini yapar
        /// </summary>
        decimal EstimateMonthEndCost(Plan plan, IEnumerable<Usage> usageHistory, int remainingDays);

        /// <summary>
        /// Ýki plan arasýndaki maliyet farkýný hesaplar
        /// </summary>
        decimal ComparePlanCosts(Plan currentPlan, Plan newPlan, int avgGbUsage, int avgMinutesUsage, int avgSmsUsage);
    }
}