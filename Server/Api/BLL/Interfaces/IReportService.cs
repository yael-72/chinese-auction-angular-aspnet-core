namespace FinalProject.BLL.Interfaces
{
    public interface IReportService
    {
        Task<byte[]> GenerateGiftWinnersReport();
        Task<byte[]> GenerateSalesRevenueReport();
    }
}
