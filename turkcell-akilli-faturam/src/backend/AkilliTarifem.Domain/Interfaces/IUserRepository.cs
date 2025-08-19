using AkilliTarifem.Domain.Entities;

namespace AkilliTarifem.Domain.Interfaces
{
    /// <summary>
    /// User-specific repository interface following Interface Segregation Principle.
    /// Contains only user-specific operations.
    /// </summary>
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetPrepaidUsersAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetUsersByPlanAsync(string planName, CancellationToken cancellationToken = default);
        Task<IEnumerable<User>> GetUsersByAgeRangeAsync(int minAge, int maxAge, CancellationToken cancellationToken = default);
        Task<User?> GetUserWithUsagesAsync(int userId, CancellationToken cancellationToken = default);
    }
}