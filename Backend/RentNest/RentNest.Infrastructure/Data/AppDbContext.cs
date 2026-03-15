using Microsoft.EntityFrameworkCore;
using RentNest.Domain.Entities;
using RentNest.Domain.Enums;

namespace RentNest.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }


        //settiing up the tables
        public DbSet<User> Users { get; set; }  //user table
        public DbSet<Reservation> Reservations { get; set; } //reservation table
        public DbSet<Property> Properties { get; set; } //property table
        public DbSet<Review> Reviews { get; set; } //reviews table
        public DbSet<PropertyImage> PropertyImages { get; set; } //Property images table

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();


            //entity relationship set up
            
            modelBuilder.Entity<Property>()  //seetting up one property hhave only one owner but one owner have many propertiees
                .HasOne(p => p.Owner)
                .WithMany(u => u.Properties)
                .HasForeignKey(p => p.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);

           
            modelBuilder.Entity<PropertyImage>() //one property have many images (5 images in our case)
                .HasOne(i => i.Property)
                .WithMany(p => p.Images)
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

         
            modelBuilder.Entity<Reservation>() //one reservation have one user only
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Reservation>() //one property have many reservations
                .HasOne(r => r.Property)
                .WithMany(p => p.Reservations)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.NoAction);

            
            modelBuilder.Entity<Review>() //one reservation have one review
                .HasOne(r => r.Reservation)
                .WithOne()
                .HasForeignKey<Review>(r => r.ReservationId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Review>() //one user cann do many reviews
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);

           
            modelBuilder.Entity<Review>() //one property have many reviews
                .HasOne(r => r.Property)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.NoAction);

            
            modelBuilder.Entity<User>() //supperAdmin data
                .HasData(new User
                {
                    UserId = "RentNestSuperAdmin",
                    FirstName = "Super",
                    MiddleName = "Admin",
                    LastName = "RentNest",
                    Gender = "Male",
                    PhoneNumber = "0000000000",
                    Email = "superadmin@rentnest.ac.in",
                    HashedPassword = "$2y$12$KN9G6XXgQ198DstRUcUPx.B6jn/xiOk6ORD8e7VyNJ2c8wkAA2BA6",
                    Role = UserRole.SuperAdmin,
                    IsOwner = false,
                    IsEmailVerified = true,
                    IsActive = true,
                    Otp = "0000",
                    RefreshToken = "0000",
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });
        }
    }
}
