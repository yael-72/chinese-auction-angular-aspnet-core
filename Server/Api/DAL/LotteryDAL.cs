using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class LotteryDAL : ILotteryDAL
    {
        private readonly CheineseSaleContext _context;
        public LotteryDAL(CheineseSaleContext context) => _context = context;

        public async Task<Gift?> GetGiftWithPurchasesAsync(int giftId)
        {
            if (giftId <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            
            // שליפת המתנה כולל הרכישות המאושרות בלבד
            return await _context.Gift
                .Include(g => g.Tickets.Where(p => p.IsPaid))
                .FirstOrDefaultAsync(g => g.Id == giftId);
        }

        public async Task AddGiftAsync(Gift gift) => await _context.Gift.AddAsync(gift);

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<int> GetRevenueAsync(int giftId)
        {
            if (giftId <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק אט מזהה וודא שהא נכוןה.");
            var gift = await _context.Gift
                .Include(g => g.Tickets)
                .FirstOrDefaultAsync(g => g.Id == giftId);

            if (gift == null) 
                throw new NotFoundException($"מתנה עם מזהה {giftId} לא נמצאה במערכת. בדוק אט המזהה ונסה שוב.");

            // sum only paid tickets
            var totalTickets = gift.Tickets?.Where(t => t.IsPaid).Sum(t => t.Amount) ?? 0;
            return totalTickets * gift.Price;
        }
    }
}
