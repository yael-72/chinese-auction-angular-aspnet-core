using FinalProject.BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class LotteryController : Controller
    {
            private readonly ILotteryService _lotteryService;
            private readonly ILogger<LotteryController> _logger;
            
            public LotteryController(ILotteryService lotteryService, ILogger<LotteryController> logger) 
            {
                _lotteryService = lotteryService;
                _logger = logger;
            }

            [HttpPost("{giftId}")]
            public async Task<IActionResult> RunDraw(int giftId)
            {
                if (giftId <= 0)
                    throw new ArgumentException("מזהה המתנה חייב להיות מספר חיובי תקין. בדוק את המזהה וודא שהוא נכון.");

                await _lotteryService.ExcuteLottery(giftId);
                return Ok(new {message = "ההגרלה בוצעה בהצלחה. הזוכה עודכן וזה מקבל הודעה בדליל."});
            }
    }
}
