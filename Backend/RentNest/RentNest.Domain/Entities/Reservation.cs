//Reservation Model

using RentNest.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentNest.Domain.Entities
{
    public class Reservation
    {
        //Primary key
        [Key]
        public int ReservationId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2")]
        public decimal TotalAmount { get; set; }

        public ReservationStatus ReservationStatus { get; set; } = ReservationStatus.Pending; //pending, confirmed, completed, cancelled 

        public string PaymentStatus { get; set; } = "pending"; //for future payment implementions

        public DateTime BookedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("PropertyId")]
        public Property Property { get; set; } = null!;

    }
}
