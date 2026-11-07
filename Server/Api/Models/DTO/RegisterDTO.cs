using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class RegisterDTO
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string UserName { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Phone]
        public string? Phone { get; set; }

        [Required, MinLength(4)]
        public string Password { get; set; } = null!;
    }
}