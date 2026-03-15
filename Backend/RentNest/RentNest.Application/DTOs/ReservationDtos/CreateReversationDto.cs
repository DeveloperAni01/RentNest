//required fields for creating server by user

using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.ReservationDtos
{
    public class CreateReversationDto
    {
        [Required]
        public int PropertyId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }
    }
}
