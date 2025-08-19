using AutoMapper;
using AkilliTarifem.Application.DTOs;
using AkilliTarifem.Domain.Entities;
using TurkcellSmartTariff.Domain.Entities;

namespace AkilliTarifem.Infrastructure.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.CurrentPlan, opt => opt.MapFrom(src => src.CurrentPlan));
            
            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<UserType>(src.Type, true)));
            
            CreateMap<UpdateUserDto, User>()
                .ForMember(dest => dest.Type, opt => opt.Condition(src => src.Type != null))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type != null ? Enum.Parse<UserType>(src.Type, true) : UserType.Postpaid));

            // Plan mappings
            CreateMap<Plan, PlanDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            
            CreateMap<CreatePlanDto, Plan>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<UserType>(src.Type, true)));

            CreateMap<Plan, CurrentPlanDto>()
                .ForMember(dest => dest.PlanId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));

            // Usage mappings
            CreateMap<Usage, UsageDto>()
                .ForMember(dest => dest.UsageId, opt => opt.MapFrom(src => src.Id));
            
            CreateMap<CreateUsageDto, Usage>();

            // Alert mappings
            CreateMap<Alert, AlertDto>()
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Level.ToString()))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            
            CreateMap<CreateAlertDto, Alert>()
                .ForMember(dest => dest.Level, opt => opt.MapFrom(src => Enum.Parse<AlertLevel>(src.Level, true)))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<AlertType>(src.Type, true)));

            // AddOnPack mappings
            CreateMap<AddOnPack, AddOnPackDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()));
            
            CreateMap<CreateAddOnPackDto, AddOnPack>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<AddOnType>(src.Type, true)));

            // PlanChangeHistory mappings
            CreateMap<PlanChangeHistory, PlanChangeHistoryDto>();
            CreateMap<CreatePlanChangeHistoryDto, PlanChangeHistory>();

            // UserAddOnPack mappings
            CreateMap<UserAddOnPack, UserAddOnPackDto>();
            CreateMap<CreateUserAddOnPackDto, UserAddOnPack>();
        }
    }
}
