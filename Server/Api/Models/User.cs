using Microsoft.AspNetCore.Identity;

namespace FinalProject.Models
{
   // public enum Role { Manager,Buyer }

    public class User
    {
        public int Id { get; private set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; } = "Buyer";
        public string HashedPassword { get; set;}

        public void SetId(int id){ 
            Id = id; 
        }
        
    }
}
