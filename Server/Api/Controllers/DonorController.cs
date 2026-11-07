using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Admin")]
    
    public class DonorController : ControllerBase
    {
        private readonly IDonorService _donorService;
        private readonly ILogger<DonorController> _logger;
        public DonorController(IDonorService donorService, ILogger<DonorController> logger)
        {
            _donorService = donorService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DonorDTO>>> Get([FromQuery] string? email, [FromQuery] string? name, [FromQuery] string? giftName)
        {
            return Ok(await _donorService.Get(email, name, giftName));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<DonorDTO>> GetById(int id)
        {
            return Ok(await _donorService.GetById(id));
        }

        [HttpPost]
        public async Task<ActionResult> Add(DonorCreateDTO donor)
        {
            await _donorService.Add(donor);
            return Ok(new {message = $"תורם '{donor.Name}' נוסף בהצלחה"});
        }
       

        [HttpPut()]
        public async Task<ActionResult> Update(DonorDTO donor)
        {
            await _donorService.Update(donor);
            return Ok(new {message = $"תורם ID {donor.Id} עודכן בהצלחה"});
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _donorService.Delete(id);
            _logger.LogInformation($"Donor {id} deleted");
            return Ok(new { message = $"תורם ID {id} נמחק בהצלחה" });
        }
    }
}
