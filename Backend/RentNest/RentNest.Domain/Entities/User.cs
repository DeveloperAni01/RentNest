//User model for all type of user

using RentNest.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RentNest.Domain.Entities
{
    public class User
    {
        //Primary key
        [Key]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string MiddleName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string HashedPassword { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Renter;

        public bool IsOwner { get; set; } = false; //superAdmin will verify can change it

        public bool IsEmailVerified { get; set; } = false;

        [MaxLength(6)]
        public string Otp { get; set; } = string.Empty;

        public DateTime? OtpExpiiry { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string RefreshToken { get; set; } = string.Empty;

        public DateTime? RefreshTokenExpiiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Property> Properties { get; set; } = new List<Property>();

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        public ICollection<Review> Reviews { get; set; } = new List<Review>();


    }
}
