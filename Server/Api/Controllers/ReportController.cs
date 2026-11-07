using FinalProject.BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportController> _logger;

        public ReportController(IReportService reportService, ILogger<ReportController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Generate a report showing all gifts and their winners with winner details
        /// </summary>
        [HttpGet("gift-winners")]
        public async Task<IActionResult> GetGiftWinnersReport()
        {
            var excelFile = await _reportService.GenerateGiftWinnersReport();
            var fileName = $"Gift_Winners_Report_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.xlsx";
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        /// <summary>
        /// Generate a report showing total sales revenue with breakdown by gift, category, and donor
        /// </summary>
        [HttpGet("sales-revenue")]
        public async Task<IActionResult> GetSalesRevenueReport()
        {
            var excelFile = await _reportService.GenerateSalesRevenueReport();
            var fileName = $"Sales_Revenue_Report_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.xlsx";
            return File(excelFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
    }
}
