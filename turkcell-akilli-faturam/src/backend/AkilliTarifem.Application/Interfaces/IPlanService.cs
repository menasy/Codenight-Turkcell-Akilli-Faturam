using AkilliTarifem.Application.DTOs;
using AkilliTarifem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IPlanService
    {
        Task<Result<List<PlanDto>>> GetAllAsync(UserType? userType = null, CancellationToken cancellationToken = default);
        Task<Result<PlanDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Result<PlanDto>> CreateAsync(CreatePlanDto createPlanDto, CancellationToken cancellationToken = default);
        Task<Result<bool>> ChangePlanAsync(int userId, int newPlanId, string reason, CancellationToken cancellationToken = default);
    }
}
