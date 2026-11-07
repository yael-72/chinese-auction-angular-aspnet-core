using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class DonorCreateDTO
    {

        [Required]
        public string Name { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Phone]
        public string? Phone { get; set; }

        [DefaultValue("ישראל")]
        public string? Country { get; set; }
    }
}
