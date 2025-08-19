using AutoMapper;
using AkilliTarifem.Application.DTOs;
using AkilliTarifem.Application.Interfaces;
using AkilliTarifem.Domain.Common;
using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Infrastructure.Services
{
    public class AlertService : IAlertService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IUsageService _usageService;

        public AlertService(IUnitOfWork unitOfWork, IMapper mapper, IUsageService usageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _usageService = usageService;
        }

        public async Task<Result<List<AlertDto>>> GetUserAlertsAsync(int userId, bool unreadOnly = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var alerts = unreadOnly
                    ? await _unitOfWork.Alerts.GetAllAsync(a => a.UserId == userId && !a.IsRead, cancellationToken)
                    : await _unitOfWork.Alerts.GetAllAsync(a => a.UserId == userId, cancellationToken);

                var alertDtos = _mapper.Map<List<AlertDto>>(alerts.OrderByDescending(a => a.CreatedAt));
                return Result<List<AlertDto>>.Success(alertDtos);
            }
            catch (Exception ex)
            {
                return Result<List<AlertDto>>.Failure($"Uyarılar getirilirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<AlertDto>> CreateAsync(CreateAlertDto createAlertDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var alert = _mapper.Map<Alert>(createAlertDto);
                await _unitOfWork.Alerts.AddAsync(alert, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var alertDto = _mapper.Map<AlertDto>(alert);
                return Result<AlertDto>.Success(alertDto);
            }
            catch (Exception ex)
            {
                return Result<AlertDto>.Failure($"Uyarı oluşturulurken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<bool>> MarkAsReadAsync(int alertId, CancellationToken cancellationToken = default)
        {
            try
            {
                var alert = await _unitOfWork.Alerts.GetByIdAsync(alertId, cancellationToken);
                if (alert == null)
                    return Result<bool>.Failure("Uyarı bulunamadı.");

                alert.MarkAsRead();
                await _unitOfWork.Alerts.UpdateAsync(alert, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Uyarı güncellenirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<bool>> CheckAndCreateAlertsAsync(int userId, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetWithPlanAsync(userId, cancellationToken);
                if (user == null)
                    return Result<bool>.Failure("Kullanıcı bulunamadı.");

                var currentMonth = DateTime.UtcNow;
                var startOfMonth = new DateTime(currentMonth.Year, currentMonth.Month, 1);
                var daysRemainingInMonth = (startOfMonth.AddMonths(1) - DateTime.UtcNow).Days;

                // Bu ay kullanımını al
                var monthlyUsage = await _unitOfWork.Usages.GetUserUsageForPeriodAsync(
                    userId, startOfMonth, currentMonth, cancellationToken);

                var totalGbUsed = monthlyUsage.Sum(u => u.MbUsed) / 1024;
                var remainingGb = user.CurrentPlan.QuotaGb - totalGbUsed;
                var usagePercentage = (totalGbUsed / user.CurrentPlan.QuotaGb) * 100;

                // Kota düşük uyarısı
                if (usagePercentage >= 90 && daysRemainingInMonth > 3)
                {
                    await CreateQuotaLowAlertAsync(userId, remainingGb, daysRemainingInMonth, cancellationToken);
                }

                // Anomali tespiti
                var anomalyResult = await _usageService.DetectAnomalyAsync(userId, cancellationToken);
                if (anomalyResult.IsSuccess && anomalyResult.Data!)
                {
                    await CreateAnomalyAlertAsync(userId, cancellationToken);
                }

                // Roaming kullanımı uyarısı
                var todayRoaming = monthlyUsage
                    .Where(u => u.Date.Date == DateTime.UtcNow.Date)
                    .Sum(u => u.RoamingMb);

                if (todayRoaming > 0)
                {
                    await CreateRoamingAlertAsync(userId, todayRoaming, cancellationToken);
                }

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Uyarı kontrolü yapılırken hata oluştu: {ex.Message}");
            }
        }

        private async Task CreateQuotaLowAlertAsync(int userId, decimal remainingGb, int daysRemaining, CancellationToken cancellationToken)
        {
            var message = $"Kota uyarısı: {remainingGb:F1}GB kota kaldı, {daysRemaining} gün var.";

            await CreateAsync(new CreateAlertDto
            {
                UserId = userId,
                Level = "Warning",
                Message = message,
                Type = "QuotaLow"
            }, cancellationToken);
        }

        private async Task CreateAnomalyAlertAsync(int userId, CancellationToken cancellationToken)
        {
            var message = "Olağandışı kullanım tespit edildi. Günlük kullanımınız normalin 2 katından fazla.";

            await CreateAsync(new CreateAlertDto
            {
                UserId = userId,
                Level = "Critical",
                Message = message,
                Type = "AnomalyDetected"
            }, cancellationToken);
        }

        private async Task CreateRoamingAlertAsync(int userId, decimal roamingMb, CancellationToken cancellationToken)
        {
            var message = $"Roaming kullanımı: Bugün {roamingMb:F1}MB roaming kullanımı tespit edildi.";

            await CreateAsync(new CreateAlertDto
            {
                UserId = userId,
                Level = "Info",
                Message = message,
                Type = "RoamingUsage"
            }, cancellationToken);
        }
    }
}
