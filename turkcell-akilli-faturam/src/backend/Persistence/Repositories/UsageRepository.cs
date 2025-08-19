using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
    public class UsageRepository : GenericRepository<Usage>, IUsageRepository
    {
        public UsageRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Usage>> GetUserUsageAsync(int userId, int days, CancellationToken cancellationToken = default)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);

            return await _dbSet
                .Where(u => u.UserId == userId && u.Date >= startDate)
                .OrderByDescending(u => u.Date)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Usage>> GetUserUsageForPeriodAsync(int userId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(u => u.UserId == userId && u.Date >= startDate && u.Date <= endDate)
                .OrderBy(u => u.Date)
                .ToListAsync(cancellationToken);
        }

        public async Task<Usage?> GetLatestUsageAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(u => u.UserId == userId)
                .OrderByDescending(u => u.Date)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
