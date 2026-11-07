using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class GiftCreateDTO
    {
        [Required]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        public string? Image { get; set; }

        public int DonorId { get; set; }
        public int CategoryId { get; set; }

        [DefaultValue(10)]
        public int Price { get; set; } = 10;

    }
}