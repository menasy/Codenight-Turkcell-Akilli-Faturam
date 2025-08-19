using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Domain.Interfaces
{
    /// <summary>
    /// Plan-specific repository interface following Interface Segregation Principle.
    /// Contains only plan-specific operations.
    /// </summary>
    public interface IPlanRepository : IRepository<Plan>
    {
        Task<Plan?> GetByNameAsync(string planName, CancellationToken cancellationToken = default);
        Task<IEnumerable<Plan>> GetActivePlansAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Plan>> GetPrepaidCompatiblePlansAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Plan>> GetPlansByPriceRangeAsync(decimal minPrice, decimal maxPrice, CancellationToken cancellationToken = default);
        Task<IEnumerable<Plan>> GetPlansByTypeAsync(PlanType planType, CancellationToken cancellationToken = default);
    }
}