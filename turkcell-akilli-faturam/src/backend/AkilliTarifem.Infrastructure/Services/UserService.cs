using AkilliTarifem.Application.DTOs;
using AkilliTarifem.Application.Interfaces;
using AkilliTarifem.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TurkcellSmartTariff.Application.Interfaces;
using TurkcellSmartTariff.Domain.Entities;

namespace AkilliTarifem.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Result<UserDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetWithPlanAsync(id, cancellationToken);
                if (user == null)
                    return Result<UserDto>.Failure("Kullanıcı bulunamadı.");

                var userDto = _mapper.Map<UserDto>(user);
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.Failure($"Kullanıcı getirilirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<List<UserDto>>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var users = await _unitOfWork.Users.GetAllAsync(cancellationToken);
                var userDtos = _mapper.Map<List<UserDto>>(users);
                return Result<List<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                return Result<List<UserDto>>.Failure($"Kullanıcılar getirilirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<UserDto>> CreateAsync(CreateUserDto createUserDto, CancellationToken cancellationToken = default)
        {
            try
            {
                // MSISDN benzersizlik kontrolü
                var existingUser = await _unitOfWork.Users.GetByMsisdnAsync(createUserDto.Msisdn, cancellationToken);
                if (existingUser != null)
                    return Result<UserDto>.Failure("Bu MSISDN numarası zaten kullanımda.");

                // Plan varlığı kontrolü
                var plan = await _unitOfWork.Plans.GetByIdAsync(createUserDto.CurrentPlanId, cancellationToken);
                if (plan == null)
                    return Result<UserDto>.Failure("Belirtilen plan bulunamadı.");

                var user = _mapper.Map<User>(createUserDto);
                await _unitOfWork.Users.AddAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var userDto = _mapper.Map<UserDto>(user);
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.Failure($"Kullanıcı oluşturulurken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<UserDto>> UpdateAsync(int id, UpdateUserDto updateUserDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
                if (user == null)
                    return Result<UserDto>.Failure("Kullanıcı bulunamadı.");

                // MSISDN güncelleme kontrolü
                if (!string.IsNullOrEmpty(updateUserDto.Msisdn) && updateUserDto.Msisdn != user.Msisdn)
                {
                    var existingUser = await _unitOfWork.Users.GetByMsisdnAsync(updateUserDto.Msisdn, cancellationToken);
                    if (existingUser != null)
                        return Result<UserDto>.Failure("Bu MSISDN numarası zaten kullanımda.");
                }

                // Plan güncelleme kontrolü
                if (updateUserDto.CurrentPlanId.HasValue && updateUserDto.CurrentPlanId != user.CurrentPlanId)
                {
                    var plan = await _unitOfWork.Plans.GetByIdAsync(updateUserDto.CurrentPlanId.Value, cancellationToken);
                    if (plan == null)
                        return Result<UserDto>.Failure("Belirtilen plan bulunamadı.");
                }

                _mapper.Map(updateUserDto, user);
                await _unitOfWork.Users.UpdateAsync(user, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var userDto = _mapper.Map<UserDto>(user);
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.Failure($"Kullanıcı güncellenirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var deleted = await _unitOfWork.Users.DeleteAsync(id, cancellationToken);
                if (!deleted)
                    return Result<bool>.Failure("Kullanıcı bulunamadı.");

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure($"Kullanıcı silinirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<Result<UserDto>> GetByMsisdnAsync(string msisdn, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByMsisdnAsync(msisdn, cancellationToken);
                if (user == null)
                    return Result<UserDto>.Failure("Kullanıcı bulunamadı.");

                var userDto = _mapper.Map<UserDto>(user);
                return Result<UserDto>.Success(userDto);
            }
            catch (Exception ex)
            {
                return Result<UserDto>.Failure($"Kullanıcı getirilirken hata oluştu: {ex.Message}");
            }
        }
    }
}
