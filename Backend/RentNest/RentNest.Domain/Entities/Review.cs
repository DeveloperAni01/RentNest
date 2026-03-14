//Review Model
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentNest.Domain.Entities
{
    public class Review
    {
        //Primary key
        [Key]
        public int ReviewId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int ReservationId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        [Range(1,5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;

        [ForeignKey("ReservationId")]
        public Reservation Reservation { get; set; } = null!;
    }
}
