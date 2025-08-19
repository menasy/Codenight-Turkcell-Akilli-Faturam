using AkilliTarifem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Msisdn { get; set; } = string.Empty;
        public UserType Type { get; set; }
        public int CurrentPlanId { get; set; }
        public PlanDto? CurrentPlan { get; set; }
    }

    public class CreateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Msisdn { get; set; } = string.Empty;
        public UserType Type { get; set; }
        public int CurrentPlanId { get; set; }
    }

    public class UpdateUserDto
    {
        public string? Name { get; set; }
        public string? Msisdn { get; set; }
        public UserType? Type { get; set; }
        public int? CurrentPlanId { get; set; }
    }
}
