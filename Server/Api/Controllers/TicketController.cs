using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketController : ControllerBase
    {
        private readonly ITicketService _ticketService;
        private readonly ILogger<TicketController> _logger;
        private readonly IMapper _mapper;
        
        public TicketController(ITicketService ticketService, ILogger<TicketController> logger, IMapper mapper)
        {
            _ticketService = ticketService;
            _logger = logger;
            _mapper = mapper;
        }

        [HttpGet("paid")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> Get(string? sort)
        {
            return Ok(await _ticketService.Get(sort));
        }

        //[Authorize(Roles = "Admin")]
        [HttpGet("paid/{giftId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetByGiftId(int giftId, string? sort)
        {
            return Ok(await _ticketService.GetByGiftId(giftId, sort));
        }

        [HttpGet("draft/{buyerId}")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetDraft(int buyerId, string? sort)
        {
            return Ok(await _ticketService.GetDraft(buyerId, sort));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<TicketDTO>> GetById(int id)
        {
            return Ok(await _ticketService.GetById(id));
        }

        [HttpPost]
        [Authorize(Roles ="Buyer")]
        public async Task<ActionResult> Add(TicketCreateDTO ticket)
        {
            await _ticketService.Add(ticket);
            return Ok(new {message = $"כרטיס נוסף בהצלחה"});
        }

        [HttpPut("amount/{id}")]
        public async Task<ActionResult> ChangeAmount(int id, int amount = 1)
        {
            await _ticketService.ChangeAmount(id,amount);
            return Ok(new {message = $"כמות הכרטיסים ID {id} עודכנה בהצלחה"});
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult> Delete(int id)
        {
            await _ticketService.Delete(id);
            return Ok(new {message = $"כרטיס ID {id} נמחק בהצלחה"});
        }

        [HttpPut("pay/{id}")]
        public async Task<ActionResult> Pay(int id)
        {
            await _ticketService.Pay(id);
            return Ok(new {message = $"כרטיס ID {id} שולם בהצלחה"});
        }

        [HttpGet("user/{buyerId}")]
        public async Task<ActionResult<IEnumerable<TicketDTO>>> GetPaidByUser(int buyerId)
        {
            var tickets = await _ticketService.GetPaidTicketsByUserIdAsync(buyerId);
            var ticketsDTO = _mapper.Map<List<TicketDTO>>(tickets);
            
            if (!ticketsDTO.Any())
                return Ok(new {message = $"לא נמצאו כרטיסים ששולמו עבור משתמש ID {buyerId}", tickets = ticketsDTO});
            
            return Ok(ticketsDTO);
        }
    }
}