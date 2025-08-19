using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.DTOs
{
    public class DashboardDto
    {
        public UserDto User { get; set; } = new();
        public CurrentUsageStatusDto CurrentUsage { get; set; } = new();
        public ForecastDto MonthlyForecast { get; set; } = new();
        public List<AlertDto> RecentAlerts { get; set; } = new();
        public List<PlanRecommendationDto> TopRecommendations { get; set; } = new();
    }

    public class CurrentUsageStatusDto
    {
        public decimal UsedGb { get; set; }
        public int UsedMinutes { get; set; }
        public int UsedSms { get; set; }
        public decimal RemainingGb { get; set; }
        public int RemainingMinutes { get; set; }
        public int RemainingSms { get; set; }
        public decimal UsagePercentageGb { get; set; }
        public decimal UsagePercentageMinutes { get; set; }
        public decimal UsagePercentageSms { get; set; }
        public int DaysRemainingInMonth { get; set; }
    }

    public class ForecastDto
    {
        public decimal ExpectedTotalGb { get; set; }
        public int ExpectedTotalMinutes { get; set; }
        public int ExpectedTotalSms { get; set; }
        public decimal ExpectedOverageGb { get; set; }
        public int ExpectedOverageMinutes { get; set; }
        public int ExpectedOverageSms { get; set; }
        public decimal ExpectedTotalCost { get; set; }
        public List<DailyUsageForecastDto> DailyForecasts { get; set; } = new();
    }

    public class DailyUsageForecastDto
    {
        public DateTime Date { get; set; }
        public decimal ExpectedGb { get; set; }
        public int ExpectedMinutes { get; set; }
        public int ExpectedSms { get; set; }
    }
}
