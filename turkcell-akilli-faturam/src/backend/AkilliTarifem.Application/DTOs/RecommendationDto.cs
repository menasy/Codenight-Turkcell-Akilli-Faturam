using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.DTOs
{
    public class RecommendationRequestDto
    {
        public int UserId { get; set; }
        public RecommendationPolicy Policy { get; set; } = new();
    }

    public class RecommendationPolicy
    {
        public string OptimizeFor { get; set; } = "lowest_total_cost";
        public string Risk { get; set; } = "low_overage";
    }

    public class RecommendationResponseDto
    {
        public int UserId { get; set; }
        public List<PlanRecommendationDto> Top3 { get; set; } = new();
        public string Rationale { get; set; } = string.Empty;
    }

    public class PlanRecommendationDto
    {
        public int PlanId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public CostBredownDto Breakdown { get; set; } = new();
        public decimal SavingsAmount { get; set; }
        public decimal SavingsPercentage { get; set; }
    }

    public class CostBredownDto
    {
        public decimal Base { get; set; }
        public decimal OverGb { get; set; }
        public decimal OverMin { get; set; }
        public decimal OverSms { get; set; }
    }
}
