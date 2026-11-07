using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class TicketDAL : ITicketDAL
    {
        private readonly CheineseSaleContext context;
        public TicketDAL(CheineseSaleContext context)
        {
            this.context = context;
        }

        public async Task Add(Ticket ticket)
        {
            if (ticket == null)
                throw new ArgumentNullException(nameof(ticket), "נתוני הכרטיס נדרשים. לא ניתן להוסיף כרטיס ריק.");
            Gift g = await context.Gift.FindAsync(ticket.GiftId);
            if (g == null)
                throw new NotFoundException($"מתנה עם מזהה {ticket.GiftId} לא נמצאת. בדוק אט מזהה בעתידה ונסה שוב.");
            if (g.WinnerId != null)
                throw new BusinessException($"לא ניתן לרכוש כרטיס ס מתנוש שכבר טבעה. הגראלה בידה עליי יושנטם. עדכן את גבול הטעות ורטוב מפסר מטבר אחר.");
            try
            {
                context.Ticket.Add(ticket);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בהוספת הכרטיס למערכת. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }

        public async Task Delete(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק אט המזהה וודא שהוא נכון.");
            var t = await context.Ticket.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (t == null)
                throw new NotFoundException($"כרטיס עם מזהה {id} לא נמצא במערכת. ֳבדוק אט המזהה ונסה שוב.");
            if (t.IsPaid)
                throw new BusinessException($"לא ניתן למחוק כרטיס שהושאלם כבר. מחק כרטיסים שסודרו טעה אחדא אט עטור מיספט.");
            try
            {
                context.Ticket.Remove(t);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה במחיקת הכרטיס. אנא נסה שוב.", ex);
            }
        }

        public async Task<List<Ticket>> Get(string? sort)
        {
            try
            {
                return await context.Ticket
                    .Where(t => t.IsPaid)
                    .Include(t => t.Gift).ThenInclude(g => g.Tickets)
                    .Include(t => t.Buyer)
                    .OrderBy(t => sort == "buyers" ? t.Gift.Tickets.Count() : sort == "price" ? t.Gift.Price : t.Id)
                    .ToListAsync();
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException("שגיאה בשליפת רשימת הכרטיסים ששולמו. אנא נסה שוב.", ex);
            }
        }

        public async Task<List<Ticket>> GetDraft(int id, string? sort)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הקונה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            try
            {
                return await context.Ticket
                    .Include(t => t.Gift)
                    .Where(t => t.BuyerId == id && !t.IsPaid)
                    .Include(t => t.Gift).ThenInclude(g => g.Tickets)
                    .ToListAsync();
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException("שגיאה בשליפת הכרטיסים המ草案ים של הקונה. אנא נסה שוב.", ex);
            }
        }

        public async Task<Ticket?> GetById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            return await context.Ticket
                .Where(c => c.Id == id)
                .Include(t => t.Buyer)
                .FirstOrDefaultAsync();
        }

        public async Task ChangeAmount(int id, int amount)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק אט המזהה וודא שהוא נכון.");
            if (amount < 0)
                throw new ArgumentException("כמות הכרטיסים לא יכולה להיות שלילית. אנא הזן כמות חיובית שוו ו-0 ו-מעלה.");
            var ticket = await context.Ticket
                .Where(c => c.Id == id)
                .FirstOrDefaultAsync();
            if (ticket == null)
                throw new NotFoundException($"כרטיס עם מזהה {id} לא נמצא. אנא בדוק אט המזהה ונסה שוב.");
            ticket.Amount = amount;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בעדכון כמות הכרטיסים. אנא נסה שוב.", ex);
            }
        }
        // Replace the problematic method with the corrected version
        //public async Task<ActionResult<string>> GetWinner(int giftId)
        //{
        //    var ticket = await context.Ticket
        //        .Where(t => t.Gift.Id == giftId && t.Gift.WinnerId != null)
        //        .FirstOrDefaultAsync();

        //    if (ticket == null)
        //        return new NotFoundResult(); // Explicitly use NotFoundResult

        //    return new OkObjectResult(ticket.Buyer.Name); // Explicitly use OkObjectResult
        //}
        public async Task<List<Ticket>> GetByGiftId(int id, string? sort)
        {
            return await context.Ticket
                .Where(t => t.GiftId == id && t.IsPaid)
                .Include(t => t.Buyer)
                .Include(t => t.Gift).ThenInclude(g => g.Tickets)
                .OrderBy(t => sort == "buyers" ? t.Gift.Tickets.Count() : t.Id)
                .ToListAsync();
        }

        public async Task Pay(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הכרטיס חייב להיות מספר חיובי תקין. בדוק אט המזהה וודא שהוא נכון.");
            var ticket = await context.Ticket
                .Where(c => c.Id == id)
                .FirstOrDefaultAsync();
            if (ticket == null)
                throw new NotFoundException($"כרטיס עם מזהה {id} לא נמצא. אט הדבר מק גדול לכטיט נכון לטטל אט הכרטיס.");
            Gift g = await context.Gift.FindAsync(ticket.GiftId);
            if (g == null)
                throw new NotFoundException("מתנה טבעה לא קיימת במערכת. אט הכרטיס אם בהוגשה ממטבר ידיע שהושפע.");
            if (g.WinnerId != null)
                throw new BusinessException("לא ניתן להטר כרטיס למטבע שכבר יושנטם. הגראלה עליי המטבע דירעה.");
            ticket.IsPaid = true;
            ticket.PaidDate = DateTime.UtcNow;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בעדכון סטטוס התשלום. אנא נסה שוב.", ex);
            }
        }

        public async Task<Ticket?> GetByBuyerAndGift(int buyerId, int giftId)
        {
            if (buyerId <= 0)
                throw new ArgumentException("מזהה הקונה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            if (giftId <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהיא נכונה.");
            return await context.Ticket
                .Where(c => c.BuyerId == buyerId && c.GiftId == giftId && !c.IsPaid)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Ticket>> GetPaidTicketsByUserIdAsync(int userId)
        {
            return await context.Ticket
                .Where(t => t.BuyerId == userId && t.IsPaid)
                .Include(t => t.Buyer)
                .Include(t => t.Gift)
                .ToListAsync();
        }
    }
}
