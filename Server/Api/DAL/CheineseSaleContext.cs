using FinalProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalProject.DAL
{
    public class CheineseSaleContext:DbContext
    {
        public CheineseSaleContext(DbContextOptions<CheineseSaleContext> options):base(options) { }
        

        public DbSet<User> User { get; set; }
        public DbSet<Donor> Donor { get; set; }
        public DbSet<Gift> Gift { get; set; }
        public DbSet<Ticket> Ticket { get; set; }
        public DbSet<Category> Category { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<Donor>()
            //    .HasIndex(u => u.Email)
            //    .IsUnique();

            modelBuilder.Entity<Donor>()
               .HasIndex(u => u.Name)
               .IsUnique();

            modelBuilder.Entity<User>()
               .HasIndex(u => u.UserName)
               .IsUnique();

            //modelBuilder.Entity<User>()
            //    .HasIndex(u => u.Email)
            //    .IsUnique();

            modelBuilder.Entity<Category>()
               .HasIndex(u => u.Name)
               .IsUnique();

            modelBuilder.Entity<Gift>()
               .HasIndex(u => u.Name)
               .IsUnique();
        }
    }
}
