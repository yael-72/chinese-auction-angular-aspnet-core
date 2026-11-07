using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class GiftDAL : IGiftDAL
    {
        private readonly CheineseSaleContext context;
        public GiftDAL(CheineseSaleContext context)
        {
            this.context = context;
        }

        public async Task Add(Gift gift)
        {
            if (gift == null)
                throw new ArgumentNullException(nameof(gift), "נתוני המתנה נדרשים. לא ניתן להוסיף מתנה ריקה.");
            try
            {
                context.Gift.Add(gift);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בהוספת המתנה למערכת. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }

        public async Task Delete(int id)
        {
            var g = await context.Gift
                .Include(g=>g.Tickets)
                .Where(c => c.Id == id)
                .FirstOrDefaultAsync();
            if (g == null)
                throw new NotFoundException($"מתנה עם מזהה {id} לא נמצאת במערכת. לא ניתן למחוק משהו שלא קיים. בדוק את המזהה וודא שהוא נכון.");
            if (g.Tickets.Count() > 0)
                foreach (Ticket t in g.Tickets)
                    if (t.IsPaid)
                        throw new BusinessException($"לא ניתן למחוק מתנה עם כרטיסים ששולמו.");
           
            try
            {
                context.Gift.Remove(g);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה במחיקת המתנה. אנא נסה שוב.", ex);
            }
        }

        public async Task DeleteAll()
        {
            var allGifts = context.Gift.ToList();
            context.Gift.RemoveRange(allGifts);
            await context.SaveChangesAsync();
        }

        public async Task<List<Gift>> Get(string? name, string? donorName, int? amount, string? sort)
        {
            try
            {
                var query = context.Gift
                    .AsNoTracking()
                    .Include(g => g.Donor)
                    .Include(g => g.Category)
                    .Include(g => g.Winner)
                    .Include(g => g.Tickets)
                    .AsQueryable();
                if (!string.IsNullOrWhiteSpace(name))
                {
                    query = query.Where(g => g.Name.Contains(name));
                }

                if (!string.IsNullOrWhiteSpace(donorName))
                {
                    query = query.Where(g => g.Donor.Name.Contains(donorName));
                }

                if (amount.HasValue)
                {
                    if (amount.Value < 0)
                        throw new ArgumentException("כמות הקונים לא יכולה להיות שלילית. אנא הזן ערך חיובי.");
                    query = query.Where(g => g.Tickets.Count() > amount.Value);
                }

                // Apply sorting
                if (!string.IsNullOrWhiteSpace(sort))
                {
                    switch (sort.ToLower())
                    {
                        case "price":
                            query = query.OrderBy(g => g.Price);
                            break;
                        case "price_desc":
                            query = query.OrderByDescending(g => g.Price);
                            break;
                        case "category":
                            query = query.OrderBy(g => g.CategoryId);
                            break;
                        case "category_desc":
                            query = query.OrderByDescending(g => g.CategoryId);
                            break;
                        case "buyers":
                            query = query.OrderBy(g => g.Tickets.Count());
                            break;
                        case "buyers_desc":
                            query = query.OrderByDescending(g => g.Tickets.Count());
                            break;
                        default:
                            query = query.OrderBy(g => g.Id);
                            break;
                    }
                }
                else
                {
                    query = query.OrderBy(g => g.Id);
                }

                var results = await query.Select(g => new Gift
                {
                    Id = g.Id,
                    Name = g.Name,
                    Description = g.Description,
                    Image = g.Image,
                    Price = g.Price,

                    // שליפת ה-ID הפשוט
                    DonorId = g.DonorId,
                    CategoryId = g.CategoryId,
                    WinnerId = g.WinnerId,

                    // שליפת האובייקט המלא (שנטען בזכות ה-Include)
                    Donor = g.Donor,
                    Category = g.Category,
                    Winner = g.Winner,
                    Tickets = g.Tickets
                }).ToListAsync();

                return results;
            }
            catch (ArgumentException ex)
            {
                throw ex;
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException("שגיאה בחיפוש המתנות. אנא בדוק את הפילטר ונסה שוב.", ex);
            }
            catch (Exception ex)
            {
                throw new BusinessException("שגיאה בשליפת רשימת המתנות ממערכת. אנא נסה שוב מאוחר יותר.", ex);
            }
        }

        public async Task<Gift> GetById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            return await context.Gift
                .Where(c => c.Id == id)
                .Include(g => g.Donor)
                .Include(g => g.Category)
                .Include(g => g.Winner)
                .Include(g => g.Tickets)
                .FirstOrDefaultAsync();
        }

        public async Task Update(Gift gift)
        {
            Gift existing = await context.Gift.FindAsync(gift.Id);
            if (existing == null)
                throw new NotFoundException($"מתנה עם מזהה {gift.Id} לא נמצאת במערכת. לא ניתן לעדכן משהו שלא קיים. בדוק את המזהה וודא שהוא נכון.");
            existing.Name = gift.Name;
            existing.Description = gift.Description;
            existing.Image = gift.Image;
            existing.DonorId = gift.DonorId;
            existing.CategoryId = gift.CategoryId;
            existing.Price = gift.Price;
            existing.WinnerId = gift.WinnerId;
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בעדכון המתנה. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }
    }
}
