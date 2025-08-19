using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Domain.Interfaces
{
    /// <summary>
    /// Usage-specific repository interface following Interface Segregation Principle.
    /// Contains only usage-specific operations.
    /// </summary>
    public interface IUsageRepository : IRepository<Usage>
    {
        Task<IEnumerable<Usage>> GetUsagesByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Usage>> GetUsagesByDateRangeAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<Usage>> GetLast90DaysUsageAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Usage>> GetMonthlyUsageAsync(int userId, int year, int month, CancellationToken cancellationToken = default);
        Task<decimal> GetTotalCostByUserAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<Usage?> GetLatestUsageByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Usage>> GetHighUsageDaysAsync(int userId, int threshold, CancellationToken cancellationToken = default);
    }
}