using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class DonorDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } 

        public string Email { get; set; } 

        public string? Phone { get; set; }

        public string? Country { get; set; }

        public IEnumerable<Gift>? gifts { get; set; }
    }
}
