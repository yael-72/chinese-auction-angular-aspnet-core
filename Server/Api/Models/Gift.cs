using System.Drawing;
using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace FinalProject.Models
{
    public class Gift
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Image { get; set; }
        public int DonorId { get; set; }
        public Donor Donor { get; set; }
        public int CategoryId { get; set; }
        public Category Category { get; set; }
        public int Price { get; set; } = 10;
        public int? WinnerId { get; set; }
        public User? Winner { get; set; }
        [JsonIgnore]
        public ICollection<Ticket>? Tickets { get; set; }

        // Helper properties for easy winner access
        [JsonIgnore]
        public bool HasWinner => WinnerId.HasValue && Winner != null;

        public void SetId(int id)
        {
            Id = id;
        }

        /// <summary>
        /// Gets the winner object if exists, otherwise returns null
        /// </summary>
        public User? GetWinner() => Winner;

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
