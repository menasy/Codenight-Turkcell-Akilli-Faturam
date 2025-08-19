using TurkcellSmartTariff.Domain.Common;

namespace TurkcellSmartTariff.Domain.Entities
{
    /// <summary>
    /// Plan entity'si. Plan bilgilerini ve iþ kurallarýný içerir.
    /// </summary>
    public class Plan : BaseEntity
    {
        public string PlanName { get; set; } = string.Empty;
        public UserType Type { get; set; }
        public decimal QuotaGb { get; set; }
        public int QuotaMin { get; set; }
        public int QuotaSms { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal OverageGb { get; set; }
        public decimal OverageMin { get; set; }
        public decimal OverageSms { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<PlanChangeHistory> PlanChangeHistories { get; set; } = new List<PlanChangeHistory>();
    }
}