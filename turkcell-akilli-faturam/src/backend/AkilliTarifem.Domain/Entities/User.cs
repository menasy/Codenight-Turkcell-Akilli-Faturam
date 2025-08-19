using TurkcellSmartTariff.Domain.Common;
using TurkcellSmartTariff.Domain.Enums;

namespace TurkcellSmartTariff.Domain.Entities
{
    /// <summary>
    /// Kullanýcý entity'si. Single Responsibility ve Encapsulation prensiplerini takip eder.
    /// </summary>
    public class User : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Msisdn { get; set; } = string.Empty;
        public UserType Type { get; set; }
        public int CurrentPlanId { get; set; }

        // Navigation Properties
        public Plan CurrentPlan { get; set; } = null!;
        public ICollection<Usage> Usages { get; set; } = new List<Usage>();
        public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
        public ICollection<PlanChangeHistory> PlanChangeHistories { get; set; } = new List<PlanChangeHistory>();
    }
}