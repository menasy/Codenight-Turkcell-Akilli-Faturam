using Microsoft.AspNetCore.Mvc;

namespace AkilliTarifem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlansController : ControllerBase
    {
        private readonly IPlanService _planService;

        public PlansController(IPlanService planService)
        {
            _planService = planService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] UserType? userType, CancellationToken cancellationToken)
        {
            var result = await _planService.GetAllAsync(userType, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _planService.GetByIdAsync(id, cancellationToken);

            if (!result.IsSuccess)
                return NotFound(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePlanDto createPlanDto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _planService.CreateAsync(createPlanDto, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPost("change-plan")]
        public async Task<IActionResult> ChangePlan([FromBody] ChangePlanRequestDto request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _planService.ChangePlanAsync(request.UserId, request.NewPlanId, request.Reason, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(new { Status = "mocked-ok", Message = "Plan değişikliği başarılı" });
        }
    }

    public class ChangePlanRequestDto
    {
        public int UserId { get; set; }
        public int NewPlanId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
