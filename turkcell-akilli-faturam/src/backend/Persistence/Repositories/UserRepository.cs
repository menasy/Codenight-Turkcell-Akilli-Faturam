using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByMsisdnAsync(string msisdn, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.CurrentPlan)
                .FirstOrDefaultAsync(u => u.Msisdn == msisdn, cancellationToken);
        }

        public async Task<User?> GetWithPlanAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.CurrentPlan)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }
    }
}
