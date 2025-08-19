using Microsoft.AspNetCore.Mvc;

namespace AkilliTarifem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsageController : ControllerBase
    {
        private readonly IUsageService _usageService;

        public UsageController(IUsageService usageService)
        {
            _usageService = usageService;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserUsage(int userId, [FromQuery] int days = 90, CancellationToken cancellationToken = default)
        {
            var result = await _usageService.GetUserUsageAsync(userId, days, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpGet("{userId:int}/summary")]
        public async Task<IActionResult> GetUsageSummary(int userId, [FromQuery] int days = 30, CancellationToken cancellationToken = default)
        {
            var result = await _usageService.GetUsageSummaryAsync(userId, days, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUsageDto createUsageDto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _usageService.CreateAsync(createUsageDto, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return CreatedAtAction(nameof(GetUserUsage), new { userId = result.Data!.UserId }, result.Data);
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk([FromBody] List<CreateUsageDto> usages, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _usageService.CreateBulkAsync(usages, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }
    }
}
