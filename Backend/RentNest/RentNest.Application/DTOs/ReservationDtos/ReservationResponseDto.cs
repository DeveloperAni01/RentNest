//custom respose after creating reversation

namespace RentNest.Application.DTOs.ReservationDtos
{
    public class ReservationResponseDto
    {
        public int ReservationId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string RenterName { get; set; } = string.Empty;

        public int PropertyId { get; set; }

        public string PropertyTitle { get; set; } = string.Empty;

        public string PropertyCity { get; set; } = string.Empty;

        public DateTime CheckInDate { get; set; }

        public DateTime CheckOutDate { get; set; }

        public int TotalNights { get; set; }

        public decimal TotalAmount { get; set; }

        public string ReservationStatus { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public DateTime BookedAt { get; set; }
    }
}
