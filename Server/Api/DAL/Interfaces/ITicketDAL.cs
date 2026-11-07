using FinalProject.Models;

namespace FinalProject.DAL.Interfaces
{
    public interface ITicketDAL
    {   
        public Task<List<Ticket>> Get(string? sort);
        public Task<List<Ticket>> GetByGiftId(int id,string? sort);
        public Task<List<Ticket>> GetDraft(int id,string? sort);
        public Task<Ticket> GetById(int id);
        public Task Delete(int id);
        public Task Add(Ticket ticket);
        public Task ChangeAmount(int id, int amount);
        public Task Pay(int id);
        public Task<Ticket?> GetByBuyerAndGift(int buyerId, int giftId);
        public Task<List<Ticket>> GetPaidTicketsByUserIdAsync(int userId);
    }
}
