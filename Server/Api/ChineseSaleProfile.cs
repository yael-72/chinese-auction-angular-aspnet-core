using AutoMapper;
using FinalProject.Models;
using FinalProject.Models.DTO;
using Microsoft.Identity.Client;
using BCrypt.Net;
using System.Linq;

namespace FinalProject
{
    public class ChineseSaleProfile:Profile
    {
        public ChineseSaleProfile()
        {
            CreateMap<RegisterDTO, User>().ForMember(u => u.HashedPassword, uc => uc.MapFrom(src => BCrypt.Net.BCrypt.HashPassword(src.Password)));
            CreateMap<GiftDTO, Gift>();
            CreateMap<TicketDTO, Ticket>();
            CreateMap<DonorDTO, Donor>();
            CreateMap<GiftCreateDTO, Gift>();
            CreateMap<TicketCreateDTO, Ticket>();
            CreateMap<DonorCreateDTO, Donor>();
            CreateMap<CategoryCreateDTO, Category>();
            CreateMap<CategoryDTO, Category>();

            CreateMap<Gift, GiftDTO>()
                .ForMember(g => g.DonorId, g => g.MapFrom(g => g.DonorId))
                .ForMember(g => g.Donor, g => g.MapFrom(g => g.Donor))
                .ForMember(g => g.CategoryId, g => g.MapFrom(g => g.CategoryId))
                .ForMember(g => g.Category, g => g.MapFrom(g => g.Category))
                .ForMember(g => g.Winner, g => g.MapFrom(g => g.Winner))
                .ForMember(g => g.BuyersAmount, g => g.MapFrom(g => g.Tickets != null ? g.Tickets.Count(t => t.IsPaid) : 0));
       
            
            CreateMap<Ticket, TicketDTO>();
            CreateMap<Donor, DonorDTO>();
            CreateMap<User, UserDTO>();
            CreateMap<Category, CategoryDTO>();


        }
    }
}
