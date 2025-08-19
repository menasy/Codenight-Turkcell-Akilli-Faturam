using AkilliTarifem.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Application.Interfaces
{
    public interface IUserService
    {
        Task<Result<UserDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Result<List<UserDto>>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Result<UserDto>> CreateAsync(CreateUserDto createUserDto, CancellationToken cancellationToken = default);
        Task<Result<UserDto>> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken = default);
        Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<Result<UserDto>> GetByMsisdnAsync(string msisdn, CancellationToken cancellationToken = default);
    }
}
