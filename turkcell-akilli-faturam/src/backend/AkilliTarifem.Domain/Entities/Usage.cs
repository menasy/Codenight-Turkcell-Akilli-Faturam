using TurkcellSmartTariff.Domain.Common;

namespace TurkcellSmartTariff.Domain.Entities
{
    /// <summary>
    /// Kullaným entity'si. Günlük kullaným verilerini tutar.
    /// </summary>
    public class Usage : BaseEntity
    {
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public decimal MbUsed { get; set; }
        public int MinutesUsed { get; set; }
        public int SmsUsed { get; set; }
        public decimal RoamingMb { get; set; }

        // Navigation Properties
        public User User { get; set; } = null!;
    }
}