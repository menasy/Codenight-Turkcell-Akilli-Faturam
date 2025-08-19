using AkilliTarifem.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<Result<DashboardDto>> GetUserDashboardAsync(int userId, CancellationToken cancellationToken = default);
        Task<Result<ForecastDto>> GetMonthlyForecastAsync(int userId, CancellationToken cancellationToken = default);
    }
}
