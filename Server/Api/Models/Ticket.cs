namespace FinalProject.Models
{
    public class Ticket
    {
        public int Id { get; private set; }
        public int BuyerId { get; set; }
        public User Buyer { get; set; }
        public int GiftId { get; set; }
        public Gift Gift { get; set; }
        public bool IsPaid { get; set; } = false;
        public int Amount { get; set; } = 1;
        public System.DateTime? PaidDate { get; set; } = null;

        public void SetId(int id)
        {
            Id = id;
        }
    }
}
