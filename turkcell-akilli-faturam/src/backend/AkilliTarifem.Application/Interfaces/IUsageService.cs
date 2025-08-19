using AkilliTarifem.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IUsageService
    {
        Task<Result<List<UsageDto>>> GetUserUsageAsync(int userId, int days = 90, CancellationToken cancellationToken = default);
        Task<Result<UsageSummaryDto>> GetUsageSummaryAsync(int userId, int days = 30, CancellationToken cancellationToken = default);
        Task<Result<UsageDto>> CreateAsync(CreateUsageDto createUsageDto, CancellationToken cancellationToken = default);
        Task<Result<List<UsageDto>>> CreateBulkAsync(List<CreateUsageDto> usages, CancellationToken cancellationToken = default);
        Task<Result<bool>> DetectAnomalyAsync(int userId, CancellationToken cancellationToken = default);
    }
}
