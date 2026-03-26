using Microsoft.EntityFrameworkCore;
using RentNest.MessagingAPI.Model;

namespace RentNest.MessagingAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        //messagee table
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.SenderId);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.ReceiverId);
        }
    }
}
