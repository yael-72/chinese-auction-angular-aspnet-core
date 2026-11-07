namespace FinalProject.Models.DTO
{
    public class GiftDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Image { get; set; }
        public int DonorId { get; set; }
        public DonorDTO? Donor { get; set; }
        public CategoryDTO? Category { get; set; }
        public int CategoryId { get; set; }
        public int Price { get; set; } = 10;
        public int? WinnerId { get; set; }
        public UserDTO? Winner { get; set; }
        public int BuyersAmount { get; set; }

        /// <summary>
        /// Helper property to check if gift has a winner
        /// </summary>
        public bool HasWinner => WinnerId.HasValue && Winner != null;

        /// <summary>
        /// Gets the winner's name if exists, otherwise returns "No Winner"
        /// </summary>
        public string GetWinnerName() => Winner?.Name ?? "No Winner";

        /// <summary>
        /// Gets the winner's email if exists, otherwise returns empty string
        /// </summary>
        public string GetWinnerEmail() => Winner?.Email ?? string.Empty;

        /// <summary>
        /// Gets the winner's phone if exists, otherwise returns empty string
        /// </summary>
        public string GetWinnerPhone() => Winner?.Phone ?? string.Empty;
    }
}