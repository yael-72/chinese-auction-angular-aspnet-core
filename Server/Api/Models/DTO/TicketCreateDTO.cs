using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class TicketCreateDTO
    {
        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int GiftId { get; set; }

        [DefaultValue(false)]
        public bool IsPaid { get; set; } = false;

        [DefaultValue(1)]
        public int Amount { get; set; } = 1;
    }
}