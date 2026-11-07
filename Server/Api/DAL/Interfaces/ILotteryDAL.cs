using FinalProject.Models;

namespace FinalProject.DAL.Interfaces
{
    public interface ILotteryDAL
    {
        Task AddGiftAsync(Gift gift);
        Task<Gift?> GetGiftWithPurchasesAsync(int giftId);
        Task SaveChangesAsync();
        Task<int> GetRevenueAsync(int giftId);
    }
}