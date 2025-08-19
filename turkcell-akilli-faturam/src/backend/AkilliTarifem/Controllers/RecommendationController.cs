using Microsoft.AspNetCore.Mvc;

namespace AkilliTarifem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationController(IRecommendationService recommendationService)
        {
            _recommendationService = recommendationService;
        }

        [HttpPost]
        public async Task<IActionResult> GetRecommendations([FromBody] RecommendationRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _recommendationService.GetRecommendationsAsync(request, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpPost("cost-calculation")]
        public async Task<IActionResult> CalculatePlanCost([FromBody] CostCalculationRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _recommendationService.CalculatePlanCostAsync(request.UserId, request.PlanId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(new { TotalCost = result.Data });
        }

        [HttpGet("add-on-packs/{userId:int}")]
        public async Task<IActionResult> GetOptimalAddOnPacks(int userId, CancellationToken cancellationToken)
        {
            var result = await _recommendationService.GetOptimalAddOnPacksAsync(userId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }
    }

    public class CostCalculationRequestDto
    {
        public int UserId { get; set; }
        public int PlanId { get; set; }
    }
}
