using Microsoft.AspNetCore.Mvc;

namespace AkilliTarifem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase
    {
        private readonly IAlertService _alertService;

        public AlertsController(IAlertService alertService)
        {
            _alertService = alertService;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetUserAlerts(int userId, [FromQuery] bool unreadOnly = false, CancellationToken cancellationToken = default)
        {
            var result = await _alertService.GetUserAlertsAsync(userId, unreadOnly, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAlertDto createAlertDto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _alertService.CreateAsync(createAlertDto, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return CreatedAtAction(nameof(GetUserAlerts), new { userId = result.Data!.UserId }, result.Data);
        }

        [HttpPatch("{alertId:int}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int alertId, CancellationToken cancellationToken)
        {
            var result = await _alertService.MarkAsReadAsync(alertId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return NoContent();
        }

        [HttpPost("check/{userId:int}")]
        public async Task<IActionResult> CheckAndCreateAlerts(int userId, CancellationToken cancellationToken)
        {
            var result = await _alertService.CheckAndCreateAlertsAsync(userId, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result.ErrorMessage);

            return Ok(new { Message = "Uyarı kontrolü tamamlandı" });
        }
    }
}
