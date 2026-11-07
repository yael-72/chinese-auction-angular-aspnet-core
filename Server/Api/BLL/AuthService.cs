using FinalProject.BLL.Interfaces;
using FinalProject.Models;
using FinalProject.Models.DTO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinalProject.DAL.Interfaces;
using BCrypt.Net;
using AutoMapper;
using System;
using FinalProject.Exceptions;

namespace FinalProject.BLL
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _config;
        private readonly IAuthDAL _authDAL;
        private readonly IMapper _mapper;
        public AuthService(IConfiguration config, IAuthDAL authDAL, IMapper mapper)
        {
            _config = config;
            _authDAL = authDAL;
            _mapper = mapper;
        }
        public async Task<string> Login(LoginDTO login)
        {
            if (login == null) 
                throw new ArgumentNullException(nameof(login), "שם משתמש וסיסמה נדרשים להתחברות. אנא הזן את שם המשתמש והסיסמה שלך.");
            
            if (string.IsNullOrWhiteSpace(login.UserName)) 
                throw new ArgumentException("שם המשתמש הנדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם משתמש תקין.");
            
            if (string.IsNullOrWhiteSpace(login.Password))
                throw new ArgumentException("הסיסמה נדרשת לא יכולה להיות ריקה או מכילה רווחים בלבד. אנא הזן סיסמה תקינה.");

            var user = await _authDAL.Login(login);
            if (user == null  || !BCrypt.Net.BCrypt.Verify(login.Password, user.HashedPassword)) 
                throw new BusinessException($"שם משתמש או סיסמה לא נכונים. בדוק את פרטי ההתחברות שלך ונסה שוב.");
            else
                return GenerateJwtToken(user);
        }

        public async Task Register(RegisterDTO register)
        {
           if (register == null) 
               throw new ArgumentNullException(nameof(register), "נתוני הרישום נדרשים. אנא ספק שם משתמש, סיסמה וכל המידע הנדרש.");
           
           if (string.IsNullOrWhiteSpace(register.UserName)) 
                throw new ArgumentException("שם המשתמש נדרש לא יכול להיות ריק או מכיל רווחים בלבד. אנא הזן שם משתמש תקין.");
           
           if (string.IsNullOrWhiteSpace(register.Password))
                throw new ArgumentException("הסיסמה נדרשת לא יכולה להיות ריקה או מכילה רווחים בלבד. אנא הזן סיסמה תקינה.");

           // check if username already exists
           var existing = await _authDAL.Login(new LoginDTO { UserName = register.UserName, Password = string.Empty });
           if (existing != null) 
               throw new ConflictException($"שם המשתמש '{register.UserName}' כבר בשימוש. בחר שם משתמש אחר ונסה שוב.");

           await _authDAL.Register( _mapper.Map<User>(register));
        }


        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim("id", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim("name", user.Name),
                new Claim("userName", user.UserName),
                new Claim("role", user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(
                    double.Parse(_config["Jwt:ExpireMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


    }
}
