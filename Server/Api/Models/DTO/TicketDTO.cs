using System.ComponentModel.DataAnnotations;

namespace FinalProject.Models.DTO
{
    public class TicketDTO
    {
        public int Id { get; set; }
        //public int BuyerId { get; set; }
        public UserDTO Buyer {  get; set; }
        public GiftDTO Gift { get; set; }
        public int GiftId { get; set; }
        public bool IsPaid { get; set; }
        public int Amount { get; set; } = 1;
        public System.DateTime? PaidDate { get; set; }
    }
}