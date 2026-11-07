using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Drawing;
using Microsoft.AspNetCore.Authorization;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Admin")]

    public class GiftController : ControllerBase
    {
        private readonly IGiftService _giftService;
        private readonly ILogger<GiftController> _logger;
        public GiftController(IGiftService giftService, ILogger<GiftController> logger)
        {
            _giftService = giftService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GiftDTO>>> Get(string? name, string? donorName, int? amount, string? sort)
        {
            return Ok(await _giftService.Get(name, donorName, amount, sort));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<GiftDTO>> GetById(int id)
        {
            return Ok(await _giftService.GetById(id));
        }

        
        [HttpPost]
       // [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Add(GiftCreateDTO gift)
        {
            await _giftService.Add(gift);
            return Ok(new {message = $"מתנה '{gift.Name}' נוספה בהצלחה"});
        }

        [HttpPut]
       // [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Update(GiftDTO gift)
        {
            await _giftService.Update(gift);
            _logger.LogInformation($"Updated gift ({gift.Id})");
            return Ok(new { message = $"מתנה ID {gift.Id} עודכנה בהצלחה" });
        }

        [HttpDelete("{id}")]
       // [Authorize(Roles ="Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            await _giftService.Delete(id);
            _logger.LogInformation($"Gift {id} deleted");
            return Ok(new { message = $"מתנה ID {id} נמחקה בהצלחה" });
        }

        [HttpDelete("all")]
       // [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteAll()
        {
            await _giftService.DeleteAll();
            return Ok(new { message = "כל המתנות נמחקו בהצלחה" });
        }
    }
}