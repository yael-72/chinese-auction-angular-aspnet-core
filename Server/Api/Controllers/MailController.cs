using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/email")]
    [Authorize(Roles = "Admin")]
    public class MailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<MailController> _logger;

        public MailController(IEmailService emailService, ILogger<MailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] SendMailDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "נתוני ההודעה נדרשים. אנא ספק את כתובת הדואר, הנושא והתוכן.");

            await _emailService.SendAsync(dto.To, dto.Subject, dto.Body);
            return Ok(new {message = $"הודעה נשלחה בהצלחה אל {dto.To}"});
        }
    }
}
