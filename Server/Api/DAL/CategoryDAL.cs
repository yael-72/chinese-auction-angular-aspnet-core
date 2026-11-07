using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using Microsoft.EntityFrameworkCore;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class CategoryDAL : ICategoryDAL
    {
        private readonly CheineseSaleContext context;
        public CategoryDAL(CheineseSaleContext context)
        {
            this.context = context;
        }
        public async Task<List<Category>> GetAll()
        {
            return await context.Category.ToListAsync();
        }

        public async Task Add(Category category)
        {
            if (category == null)
                throw new ArgumentNullException(nameof(category), "נתוני הקטגוריה נדרשים. לא ניתן להוסיף קטגוריה ריקה.");
            try
            {
                context.Category.Add(category);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בהוספת הקטגוריה למערכת. אנא בדוק אט השם ונסה שוב.", ex);
            }
        }
        public async Task Delete(int id)
        {
            if (id <= 0)
                throw new ArgumentException("מזהה הקטגוריה חייב להיות מספר חיובי תקין. בדוק אט מזהה וודא שהוא נכון.");
            var c = await context.Category.Where(c => c.Id == id).FirstOrDefaultAsync();
            if (c == null)
                throw new NotFoundException($"קטגוריה עם מזהה {id} לא נמצאה במערכת. בדוק אט המזהה וודא שהוא קיימה.");
            try
            {
                context.Category.Remove(c);
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה במחיקת הקטגוריה. אנא נסה שוב.", ex);
            }
        }
    }
}
