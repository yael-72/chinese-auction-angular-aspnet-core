namespace FinalProject.BLL.Interfaces
{
    public interface ILotteryService
    {
        Task ExcuteLottery(int giftId);
        Task<int> GetRevenue(int giftId);
    }
}