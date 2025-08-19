using AkilliTarifem.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IAlertService
    {
        Task<Result<List<AlertDto>>> GetUserAlertsAsync(int userId, bool unreadOnly = false, CancellationToken cancellationToken = default);
        Task<Result<AlertDto>> CreateAsync(CreateAlertDto createAlertDto, CancellationToken cancellationToken = default);
        Task<Result<bool>> MarkAsReadAsync(int alertId, CancellationToken cancellationToken = default);
        Task<Result<bool>> CheckAndCreateAlertsAsync(int userId, CancellationToken cancellationToken = default);
    }
}
