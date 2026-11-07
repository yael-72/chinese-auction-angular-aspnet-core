using FinalProject.DAL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using Microsoft.EntityFrameworkCore;
using FinalProject.Exceptions;

namespace FinalProject.DAL
{
    public class AuthDAL : IAuthDAL
    {
        private readonly CheineseSaleContext _context;

        public AuthDAL(CheineseSaleContext context)
        {
            _context = context;  
        }

        public async Task<User?> Login(LoginDTO login)
        {
            if (login == null)
                throw new ArgumentNullException(nameof(login), "נתוני ההתחברות נדרשים. לא נוכל להטעות users null.");
            
            if (string.IsNullOrWhiteSpace(login.UserName))
                throw new ArgumentException("שם המשתמש נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם משתמש סטנדרטי.");
            
            try
            {
                return await _context.User.FirstOrDefaultAsync(u => u.UserName == login.UserName);
            }
            catch (Exception ex)
            {
                throw new BusinessException("שגיאה בחישוד בבדיקת סיסטם. אנא נסה שוב ושוב שוב.", ex);
            }
        }

        public async Task Register(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user), "נתוני המשתמש נדרשים. לא ניתן להרשם ללא פרטים.");
            
            if (string.IsNullOrWhiteSpace(user.UserName))
                throw new ArgumentException("שם המשתמש נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם משתמש תקין.");
            
            try
            {
                _context.User.Add(user);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BusinessException("שגיאה בהרשמת המשתמש למערכת. ייתכן ששם המשתמש כבר בשימוש. אנא בדוק את הנתונים ונסה שוב.", ex);
            }
        }
    }
}
