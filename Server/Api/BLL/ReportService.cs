using FinalProject.BLL.Interfaces;
using FinalProject.DAL;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FinalProject.BLL
{
    public class ReportService : IReportService
    {
        private readonly CheineseSaleContext _context;

        public ReportService(CheineseSaleContext context)
        {
            _context = context;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task<byte[]> GenerateGiftWinnersReport()
        {
            var gifts = await _context.Gift
                .Include(g => g.Donor)
                .Include(g => g.Winner)
                .Include(g => g.Category)
                .OrderBy(g => g.Id)
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Gift Winners");

                // Set Up Header Style
                worksheet.Cells[1, 1].Value = "Gift Winners Report";
                var titleCell = worksheet.Cells[1, 1];
                titleCell.Style.Font.Size = 18;
                titleCell.Style.Font.Bold = true;
                titleCell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                titleCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                titleCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(31, 78, 121));
                titleCell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                var mergeRange = worksheet.Cells[1, 1, 1, 9];
                mergeRange.Merge = true;

                // Add Date
                worksheet.Cells[2, 1].Value = $"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
                worksheet.Cells[2, 1].Style.Font.Italic = true;
                worksheet.Cells[2, 1].Style.Font.Size = 10;

                // Create Header Row
                worksheet.Cells[4, 1].Value = "Gift ID";
                worksheet.Cells[4, 2].Value = "Gift Name";
                worksheet.Cells[4, 3].Value = "Category";
                worksheet.Cells[4, 4].Value = "Price";
                worksheet.Cells[4, 5].Value = "Donor Name";
                worksheet.Cells[4, 6].Value = "Donor Email";
                worksheet.Cells[4, 7].Value = "Winner Name";
                worksheet.Cells[4, 8].Value = "Winner Email";
                worksheet.Cells[4, 9].Value = "Winner Phone";

                // Style Header Row
                for (int col = 1; col <= 9; col++)
                {
                    var cell = worksheet.Cells[4, col];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(79, 129, 189));
                    cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    cell.Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                }

                // Add Data Rows
                int row = 5;
                bool isAlternate = false;
                foreach (var gift in gifts)
                {
                    worksheet.Cells[row, 1].Value = gift.Id;
                    worksheet.Cells[row, 2].Value = gift.Name;
                    worksheet.Cells[row, 3].Value = gift.Category?.Name ?? "N/A";
                    worksheet.Cells[row, 4].Value = gift.Price;
                    worksheet.Cells[row, 5].Value = gift.Donor?.Name ?? "N/A";
                    worksheet.Cells[row, 6].Value = gift.Donor?.Email ?? "N/A";
                    worksheet.Cells[row, 7].Value = gift.Winner?.Name ?? "No Winner Yet";
                    worksheet.Cells[row, 8].Value = gift.Winner?.Email ?? "-";
                    worksheet.Cells[row, 9].Value = gift.Winner?.Phone ?? "-";

                    // Alternate row colors
                    if (isAlternate)
                    {
                        for (int col = 1; col <= 9; col++)
                        {
                            worksheet.Cells[row, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            worksheet.Cells[row, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(217, 227, 239));
                        }
                    }

                    worksheet.Cells[row, 4].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
                    
                    row++;
                    isAlternate = !isAlternate;
                }

                // Auto fit columns
                worksheet.Columns[1].Width = 12;
                worksheet.Columns[2].Width = 18;
                worksheet.Columns[3].Width = 15;
                worksheet.Columns[4].Width = 10;
                worksheet.Columns[5].Width = 18;
                worksheet.Columns[6].Width = 22;
                worksheet.Columns[7].Width = 18;
                worksheet.Columns[8].Width = 22;
                worksheet.Columns[9].Width = 15;

                // Add Summary Section
                int summaryRow = row + 2;
                worksheet.Cells[summaryRow, 1].Value = "Summary";
                worksheet.Cells[summaryRow, 1].Style.Font.Bold = true;
                worksheet.Cells[summaryRow, 1].Style.Font.Size = 12;

                summaryRow++;
                worksheet.Cells[summaryRow, 1].Value = "Total Gifts:";
                worksheet.Cells[summaryRow, 2].Value = gifts.Count;
                worksheet.Cells[summaryRow, 1].Style.Font.Bold = true;

                summaryRow++;
                var giftWithWinners = gifts.Count(g => g.WinnerId.HasValue);
                worksheet.Cells[summaryRow, 1].Value = "Gifts with Winners:";
                worksheet.Cells[summaryRow, 2].Value = giftWithWinners;
                worksheet.Cells[summaryRow, 1].Style.Font.Bold = true;

                summaryRow++;
                var giftsWithoutWinners = gifts.Count(g => !g.WinnerId.HasValue);
                worksheet.Cells[summaryRow, 1].Value = "Gifts without Winners:";
                worksheet.Cells[summaryRow, 2].Value = giftsWithoutWinners;
                worksheet.Cells[summaryRow, 1].Style.Font.Bold = true;

                return package.GetAsByteArray();
            }
        }

        public async Task<byte[]> GenerateSalesRevenueReport()
        {
            var tickets = await _context.Ticket
                .Where(t => t.IsPaid)
                .Include(t => t.Gift)
                .ThenInclude(g => g.Donor)
                .Include(t => t.Gift)
                .ThenInclude(g => g.Category)
                .Include(t => t.Buyer)
                .ToListAsync();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Revenue Report");

                // Set Up Header Style
                worksheet.Cells[1, 1].Value = "Total Sales Revenue Report";
                var titleCell = worksheet.Cells[1, 1];
                titleCell.Style.Font.Size = 18;
                titleCell.Style.Font.Bold = true;
                titleCell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                titleCell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                titleCell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 128, 96));
                titleCell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                var mergeRange2 = worksheet.Cells[1, 1, 1, 6];
                mergeRange2.Merge = true;

                // Add Date
                worksheet.Cells[2, 1].Value = $"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
                worksheet.Cells[2, 1].Style.Font.Italic = true;
                worksheet.Cells[2, 1].Style.Font.Size = 10;

                // Revenue by Gift
                worksheet.Cells[4, 1].Value = "Revenue by Gift";
                worksheet.Cells[4, 1].Style.Font.Bold = true;
                worksheet.Cells[4, 1].Style.Font.Size = 14;
                worksheet.Cells[4, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[4, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(200, 220, 210));

                // Create Header Row for Gift Revenue
                worksheet.Cells[5, 1].Value = "Gift ID";
                worksheet.Cells[5, 2].Value = "Gift Name";
                worksheet.Cells[5, 3].Value = "Category";
                worksheet.Cells[5, 4].Value = "Tickets Sold";
                worksheet.Cells[5, 5].Value = "Unit Price";
                worksheet.Cells[5, 6].Value = "Total Revenue";

                // Style Header Row
                for (int col = 1; col <= 6; col++)
                {
                    var cell = worksheet.Cells[5, col];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 128, 96));
                    cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                }

                // Group by Gift and calculate revenue
                var giftRevenue = tickets
                    .GroupBy(t => t.Gift)
                    .Select(g => new
                    {
                        Gift = g.Key,
                        TicketCount = g.Sum(t => t.Amount),
                        Revenue = g.Sum(t => t.Amount * t.Gift.Price)
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ToList();

                int row = 6;
                decimal totalRevenue = 0;
                bool isAlternate = false;

                foreach (var item in giftRevenue)
                {
                    worksheet.Cells[row, 1].Value = item.Gift.Id;
                    worksheet.Cells[row, 2].Value = item.Gift.Name;
                    worksheet.Cells[row, 3].Value = item.Gift.Category?.Name ?? "N/A";
                    worksheet.Cells[row, 4].Value = item.TicketCount;
                    worksheet.Cells[row, 5].Value = item.Gift.Price;
                    worksheet.Cells[row, 6].Value = item.Revenue;

                    // Apply currency format
                    worksheet.Cells[row, 5].Style.Numberformat.Format = "$#,##0.00";
                    worksheet.Cells[row, 6].Style.Numberformat.Format = "$#,##0.00";

                    // Alternate row colors
                    if (isAlternate)
                    {
                        for (int col = 1; col <= 6; col++)
                        {
                            worksheet.Cells[row, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            worksheet.Cells[row, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(220, 240, 230));
                        }
                    }

                    totalRevenue += item.Revenue;
                    row++;
                    isAlternate = !isAlternate;
                }

                // Total row for gifts
                worksheet.Cells[row, 1].Value = "TOTAL";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                worksheet.Cells[row, 6].Value = totalRevenue;
                worksheet.Cells[row, 6].Style.Font.Bold = true;
                worksheet.Cells[row, 6].Style.Numberformat.Format = "$#,##0.00";
                worksheet.Cells[row, 6].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[row, 6].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 128, 96));
                worksheet.Cells[row, 6].Style.Font.Color.SetColor(System.Drawing.Color.White);

                // Revenue by Category
                row += 3;
                worksheet.Cells[row, 1].Value = "Revenue by Category";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                worksheet.Cells[row, 1].Style.Font.Size = 14;
                worksheet.Cells[row, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[row, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(200, 220, 210));

                row++;
                worksheet.Cells[row, 1].Value = "Category";
                worksheet.Cells[row, 2].Value = "Total Revenue";
                worksheet.Cells[row, 3].Value = "Percentage";

                // Style Header Row
                for (int col = 1; col <= 3; col++)
                {
                    var cell = worksheet.Cells[row, col];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 128, 96));
                    cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                }

                row++;
                var categoryRevenue = tickets
                    .GroupBy(t => t.Gift.Category.Name)
                    .Select(g => new
                    {
                        Category = g.Key,
                        Revenue = g.Sum(t => t.Amount * t.Gift.Price)
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ToList();

                isAlternate = false;
                foreach (var item in categoryRevenue)
                {
                    worksheet.Cells[row, 1].Value = item.Category;
                    worksheet.Cells[row, 2].Value = item.Revenue;
                    worksheet.Cells[row, 3].Value = totalRevenue > 0 ? (item.Revenue / totalRevenue) : 0;

                    worksheet.Cells[row, 2].Style.Numberformat.Format = "$#,##0.00";
                    worksheet.Cells[row, 3].Style.Numberformat.Format = "0.00%";

                    // Alternate row colors
                    if (isAlternate)
                    {
                        for (int col = 1; col <= 3; col++)
                        {
                            worksheet.Cells[row, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            worksheet.Cells[row, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(220, 240, 230));
                        }
                    }

                    row++;
                    isAlternate = !isAlternate;
                }

                // Revenue by Donor
                row += 3;
                worksheet.Cells[row, 1].Value = "Revenue by Donor";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                worksheet.Cells[row, 1].Style.Font.Size = 14;
                worksheet.Cells[row, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[row, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(200, 220, 210));

                row++;
                worksheet.Cells[row, 1].Value = "Donor Name";
                worksheet.Cells[row, 2].Value = "Donor Email";
                worksheet.Cells[row, 3].Value = "Total Revenue";

                // Style Header Row
                for (int col = 1; col <= 3; col++)
                {
                    var cell = worksheet.Cells[row, col];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(0, 128, 96));
                    cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                }

                row++;
                var donorRevenue = tickets
                    .GroupBy(t => t.Gift.Donor)
                    .Select(g => new
                    {
                        Donor = g.Key,
                        Revenue = g.Sum(t => t.Amount * t.Gift.Price)
                    })
                    .OrderByDescending(x => x.Revenue)
                    .ToList();

                isAlternate = false;
                foreach (var item in donorRevenue)
                {
                    worksheet.Cells[row, 1].Value = item.Donor.Name ?? "N/A";
                    worksheet.Cells[row, 2].Value = item.Donor.Email ?? "N/A";
                    worksheet.Cells[row, 3].Value = item.Revenue;

                    worksheet.Cells[row, 3].Style.Numberformat.Format = "$#,##0.00";

                    // Alternate row colors
                    if (isAlternate)
                    {
                        for (int col = 1; col <= 3; col++)
                        {
                            worksheet.Cells[row, col].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                            worksheet.Cells[row, col].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(220, 240, 230));
                        }
                    }

                    row++;
                    isAlternate = !isAlternate;
                }

                // Summary Statistics
                row += 2;
                worksheet.Cells[row, 1].Value = "Summary Statistics";
                worksheet.Cells[row, 1].Style.Font.Bold = true;
                worksheet.Cells[row, 1].Style.Font.Size = 12;
                worksheet.Cells[row, 1].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Cells[row, 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(200, 220, 210));

                row++;
                worksheet.Cells[row, 1].Value = "Total Tickets Sold:";
                worksheet.Cells[row, 2].Value = tickets.Sum(t => t.Amount);
                worksheet.Cells[row, 1].Style.Font.Bold = true;

                row++;
                worksheet.Cells[row, 1].Value = "Total Revenue:";
                worksheet.Cells[row, 2].Value = totalRevenue;
                worksheet.Cells[row, 2].Style.Numberformat.Format = "$#,##0.00";
                worksheet.Cells[row, 1].Style.Font.Bold = true;

                row++;
                var avgPrice = tickets.Count > 0 ? tickets.Average(t => t.Gift.Price) : 0;
                worksheet.Cells[row, 1].Value = "Average Ticket Price:";
                worksheet.Cells[row, 2].Value = avgPrice;
                worksheet.Cells[row, 2].Style.Numberformat.Format = "$#,##0.00";
                worksheet.Cells[row, 1].Style.Font.Bold = true;

                // Auto fit columns
                worksheet.Columns[1].Width = 20;
                worksheet.Columns[2].Width = 25;
                worksheet.Columns[3].Width = 15;
                worksheet.Columns[4].Width = 15;
                worksheet.Columns[5].Width = 15;
                worksheet.Columns[6].Width = 15;

                return package.GetAsByteArray();
            }
        }
    }
}
