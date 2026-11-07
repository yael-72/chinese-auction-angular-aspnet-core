using FinalProject.Models;
using FinalProject.Models.DTO;

namespace FinalProject.BLL.Interfaces
{
    public interface ITicketService
    {
        public Task<List<TicketDTO>> Get(string? sort);
        public Task<List<TicketDTO>> GetByGiftId(int id, string? sort);
        public Task<List<TicketDTO>> GetDraft(int id, string? sort);
        public Task<TicketDTO> GetById(int id);
        public Task Delete(int id);
        public Task Add(TicketCreateDTO ticketDTO);
        public Task ChangeAmount(int id, int amount);
        public Task Pay(int id);
        public Task<List<TicketDTO>> GetPaidTicketsByUserIdAsync(int userId);
    }
}
