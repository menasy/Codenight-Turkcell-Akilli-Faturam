using AkilliTarifem.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IRecommendationService
    {
        Task<Result<RecommendationResponseDto>> GetRecommendationsAsync(RecommendationRequestDto request, CancellationToken cancellationToken = default);
        Task<Result<decimal>> CalculatePlanCostAsync(int userId, int planId, CancellationToken cancellationToken = default);
        Task<Result<List<AddOnPackDto>>> GetOptimalAddOnPacksAsync(int userId, CancellationToken cancellationToken = default);
    }
}
