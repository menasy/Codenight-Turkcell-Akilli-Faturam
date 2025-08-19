using Microsoft.AspNetCore.Mvc;

namespace AkilliTarifem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserDashboard(int userId, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetUserDashboardAsync(userId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpGet("{userId:int}/forecast")]
        public async Task<IActionResult> GetMonthlyForecast(int userId, CancellationToken cancellationToken)
        {
            var result = await _dashboardService.GetMonthlyForecastAsync(userId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }
    }
}
