using FinalProject.Models;
using FinalProject.Models.DTO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinalProject.BLL.Interfaces
{
    public interface IAuthService
    {
        public Task<string> Login(LoginDTO login);
        public Task Register(RegisterDTO register);


        
    }
}
