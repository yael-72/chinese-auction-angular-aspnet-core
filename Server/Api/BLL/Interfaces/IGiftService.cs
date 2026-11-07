using FinalProject.Models;
using FinalProject.Models.DTO;

namespace FinalProject.BLL.Interfaces
{
    public interface IGiftService
    {
        public Task<List<GiftDTO>> Get(string? name, string? donorName, int? amount, string? sort);
        public Task<GiftDTO> GetById(int id);
        public Task Delete(int id);
        public Task Add(GiftCreateDTO giftDTO);
        public Task Update(GiftDTO giftDTO);
        public Task DeleteAll(); // Add this line
    }
}
