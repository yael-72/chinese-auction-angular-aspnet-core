using FinalProject.BLL.Interfaces;
using FinalProject.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using FinalProject.Exceptions;

namespace FinalProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService,ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDTO login)
        {
            var token = await _authService.Login(login);
            return Ok(new {token=token, message = "התחברות בוצעה בהצלחה"});
        }
        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDTO register)
        {
            await _authService.Register(register);
            return Ok(new {message = $"משתמש {register.UserName} נרשם בהצלחה"});
        }
    }
}
