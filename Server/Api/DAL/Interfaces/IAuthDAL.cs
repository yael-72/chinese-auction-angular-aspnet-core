using FinalProject.Models;
using FinalProject.Models.DTO;

namespace FinalProject.DAL.Interfaces
{
    public interface IAuthDAL
    {
        public Task<User?> Login(LoginDTO user);
        public Task Register(User user);

    }
}
