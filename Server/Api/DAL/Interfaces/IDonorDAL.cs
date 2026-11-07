using FinalProject.Models;

namespace FinalProject.DAL.Interfaces
{
    public interface IDonorDAL
    {
        public Task<List<Donor>> Get(string? email, string? name, string? giftName);
        public Task<Donor> GetById(int id);
        public Task Delete(int id);
        public Task Add(Donor donor);
        public Task Update(Donor donor);
    }
}
