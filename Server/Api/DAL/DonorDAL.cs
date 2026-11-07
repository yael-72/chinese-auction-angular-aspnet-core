using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class DonorDAL : IDonorDAL
{
    private readonly CheineseSaleContext context;
    public DonorDAL(CheineseSaleContext context)
    {
        this.context = context;
    }
    
        public async Task Add(Donor donor)
        {
            if (donor == null)
                throw new ArgumentNullException(nameof(donor), "נתוני התורם נדרשים. לא ניתן להוסיף תורם ריק.");
            try
            {
                context.Donor.Add(donor);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בהוספת התורם למערכת. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }

        public async Task Delete(int id)
        {
            var d = await context.Donor.Where(d => d.Id == id).FirstOrDefaultAsync();
            if (d == null)
                throw new NotFoundException($"תורם עם מזהה {id} לא נמצא במערכת. בדוק אט המזהה וודא שהוא נכון.");
            context.Donor.Remove(d);
            await context.SaveChangesAsync();
        }

        public async Task<List<Donor>> Get(string? email, string? name, string? giftName)
        {
            try
            {
                return await context.Donor.Include(d=>d.Gifts)
                    .Where(d=> 
                                (email==null?true: d.Email.Contains(email))
                                && (name == null ? true : d.Name.Contains(name))
                                && (giftName == null ? true : d.Gifts.Any(g => g.Name.Contains(giftName)))
                            )
                    .ToListAsync();
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessException("שגיאה בחיפוש התורמים. אנא בדוק את הפילטר ונסה שוב.", ex);
            }
        }

        public async Task<Donor> GetById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה התורם חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");
            return await context.Donor
                .Where(d => d.Id == id)
                .Include(d=>d.Gifts)
                .FirstOrDefaultAsync();

        }

        public async Task Update(Donor donor)
        {
            if (donor == null)
                throw new ArgumentNullException(nameof(donor), "נתוני התורם לעדכון נדרשים. לא ניתן לעדכן תורם שלא קיים.");
            try
            {
                context.Donor.Update(donor);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new NotFoundException("התורם שנבחאת בעדכון לא קיים במערכת. אנא נסה שוב ונסה שוב.");
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בעדכון התורם. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }
    }
}
