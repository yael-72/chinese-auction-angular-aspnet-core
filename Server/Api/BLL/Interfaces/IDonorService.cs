using FinalProject.Models.DTO;
using FinalProject.Models;

namespace FinalProject.BLL.Interfaces
{
    public interface IDonorService
    {
        public Task<List<DonorDTO>> Get(string? email,string? name, string? giftName);
        public Task<DonorDTO> GetById(int id);
        public Task Delete(int id);
        public Task Add(DonorCreateDTO donor);
        public Task Update(DonorDTO donor);
    }
}
