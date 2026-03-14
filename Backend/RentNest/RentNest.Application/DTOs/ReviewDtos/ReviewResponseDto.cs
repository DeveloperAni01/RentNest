//custom review respose to send user after review creation
namespace RentNest.Application.DTOs.ReviewDtos
{
    public class ReviewResponseDto
    {
        public int ReviewId { get; set; }

        public int ReservationId { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string RenterName { get; set; } = string.Empty;

        public int PropertyId { get; set; }

        public string PropertyTitle { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
