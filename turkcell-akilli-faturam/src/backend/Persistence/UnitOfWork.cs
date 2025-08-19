using Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        private IUserRepository? _users;
        public IUserRepository Users => _users ??= new UserRepository(_context);

        private IUsageRepository? _usages;
        public IUsageRepository Usages => _usages ??= new UsageRepository(_context);

        private IGenericRepository<Plan>? _plans;
        public IGenericRepository<Plan> Plans => _plans ??= new GenericRepository<Plan>(_context);

        private IGenericRepository<Alert>? _alerts;
        public IGenericRepository<Alert> Alerts => _alerts ??= new GenericRepository<Alert>(_context);

        private IGenericRepository<AddOnPack>? _addOnPacks;
        public IGenericRepository<AddOnPack> AddOnPacks => _addOnPacks ??= new GenericRepository<AddOnPack>(_context);

        private IGenericRepository<UserAddOnPack>? _userAddOnPacks;
        public IGenericRepository<UserAddOnPack> UserAddOnPacks => _userAddOnPacks ??= new GenericRepository<UserAddOnPack>(_context);

        private IGenericRepository<PlanChangeHistory>? _planChangeHistories;
        public IGenericRepository<PlanChangeHistory> PlanChangeHistories => _planChangeHistories ??= new GenericRepository<PlanChangeHistory>(_context);

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync(cancellationToken);
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
