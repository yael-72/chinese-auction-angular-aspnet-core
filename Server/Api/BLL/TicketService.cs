using AutoMapper;
using FinalProject.BLL.Interfaces;
using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using FinalProject.Exceptions;

namespace FinalProject.BLL
{
    public class TicketService : ITicketService
    {
        private readonly ITicketDAL _ticketDal;
        private readonly IMapper _mapper;
        public TicketService(ITicketDAL ticketDal, IMapper mapper)
        {
            _ticketDal = ticketDal;
            _mapper = mapper;
        }

        public async Task<List<TicketDTO>> Get(string? sort)
        {
            var tickets = await _ticketDal.Get(sort);
            return _mapper.Map<List<TicketDTO>>(tickets);
        }
        public async Task<List<TicketDTO>> GetDraft(int id, string? sort)
        {
            var tickets = await _ticketDal.GetDraft(id, sort);
            return _mapper.Map<List<TicketDTO>>(tickets);
        }


        public async Task<TicketDTO> GetById(int id)
        {
            var t = await _ticketDal.GetById(id);
            if (t == null)
                throw new NotFoundException($"כרטיס עם מזהה {id} לא נמצא במערכת. בדוק את המזהה וודא שהוא תקין.");
            return _mapper.Map<TicketDTO>(t);
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            await _ticketDal.Delete(id);
        }

        public async Task Add(TicketCreateDTO ticketDTO)
        {
            if (ticketDTO == null) 
                throw new ArgumentNullException(nameof(ticketDTO), "נתוני הכרטיס נדרשים. אנא ספק את מידע הקונה ובחר מתנה.");
            
            if (ticketDTO.BuyerId <= 0) 
                throw new ArgumentException("מזהה הקונה חייב להיות מספר חיובי תקין. בחר קונה תקין.");
            
            if (ticketDTO.GiftId <= 0) 
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בחר מתנה תקינה.");

            var t = await _ticketDal.GetByBuyerAndGift(ticketDTO.BuyerId, ticketDTO.GiftId);
            if (t != null )
            {
                await _ticketDal.ChangeAmount(t.Id, t.Amount + 1);
            }
            else
            {
                var ticket = _mapper.Map<Ticket>(ticketDTO);
                await _ticketDal.Add(ticket);
            }

        }

        public async Task ChangeAmount(int id, int amount)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            if (amount < 0)
                throw new ArgumentException("כמות הכרטיסים לא יכולה להיות שלילית. אנא הזן כמות של 0 ומעלה.");

            await _ticketDal.ChangeAmount(id, amount);
        }

        public async Task<List<TicketDTO>> GetByGiftId(int id, string? sort)
        {
            var tickets = await _ticketDal.GetByGiftId(id, sort);
            return _mapper.Map<List<TicketDTO>>(tickets);
        }

        public async Task Pay(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");

            var ticket = await _ticketDal.GetById(id);
            if (ticket == null)
                throw new NotFoundException($"כרטיס עם מזהה {id} לא נמצא במערכת. לא ניתן לעדכן תשלום לכרטיס שלא קיים. בדוק את המזהה ונסה שוב.");
            await _ticketDal.Pay(id);
        }

        public async Task<List<TicketDTO>> GetPaidTicketsByUserIdAsync(int userId)
        {
            var tickets = await _ticketDal.GetPaidTicketsByUserIdAsync(userId);
            return _mapper.Map<List<TicketDTO>>(tickets);
        }
    }
}
