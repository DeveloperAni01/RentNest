//property model
using RentNest.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentNest.Domain.Entities
{
    public class Property
    {
        //Primary key
        [Key]
        public int PropertyId { get; set; }

        [Required]
        public string OwnerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string City { get; set; } = string.Empty;

        [Required]
        public PropertyType PropertyType { get; set; }

        [Required]
        [Column(TypeName ="decimal(10,2")]
        public decimal PricePerNight { get; set; }

        [Required]
        public int MaxGuests { get; set; }

        [Required]
        public string CheckInTime { get; set; } = string.Empty;

        [Required]
        public string CheckOutTime { get; set; } = string.Empty;

        public string Features { get; set; } = string.Empty; // like pool,sea view,wifi etc..

        [Column(TypeName = "decimal(5,2")]
        public decimal Rating { get; set; } = 0;

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("OwnerId")]
        public User Owner { get; set; } = null!;

        public ICollection<Review> Reviews { get; set; } = new List<Review>();

        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();

    }
}
