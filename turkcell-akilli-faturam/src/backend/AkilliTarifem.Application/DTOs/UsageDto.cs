namespace AkilliTarifem.Application.DTOs
{
    /// <summary>
    /// Kullaným verilerini transfer etmek için kullanýlan DTO.
    /// </summary>
    public class UsageDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public decimal MbUsed { get; set; }
        public int MinutesUsed { get; set; }
        public int SmsUsed { get; set; }
        public decimal RoamingMb { get; set; }
    }

    public class CreateUsageDto
    {
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public decimal MbUsed { get; set; }
        public int MinutesUsed { get; set; }
        public int SmsUsed { get; set; }
        public decimal RoamingMb { get; set; }
    }

    public class UsageSummaryDto
    {
        public decimal TotalGbUsed { get; set; }
        public int TotalMinutesUsed { get; set; }
        public int TotalSmsUsed { get; set; }
        public decimal TotalRoamingMb { get; set; }
        public decimal AvgDailyGb { get; set; }
        public int AvgDailyMinutes { get; set; }
        public int AvgDailySms { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}