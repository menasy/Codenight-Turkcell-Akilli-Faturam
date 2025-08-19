using AkilliTarifem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.DTOs
{
    public class PlanDto
    {
        public int Id { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public UserType Type { get; set; }
        public decimal QuotaGb { get; set; }
        public int QuotaMin { get; set; }
        public int QuotaSms { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal OverageGb { get; set; }
        public decimal OverageMin { get; set; }
        public decimal OverageSms { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreatePlanDto
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
    }
}
