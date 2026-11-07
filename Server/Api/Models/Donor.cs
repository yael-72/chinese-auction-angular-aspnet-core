using System.Text.Json.Serialization;

namespace FinalProject.Models
{
    public class Donor
    {
        public int Id { get; private set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Country { get; set; }
        [JsonIgnore]
        public IEnumerable<Gift>? Gifts { get; set; }

        public void SetId(int id) {  Id = id; }


    }
}
