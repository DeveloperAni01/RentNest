//need for during property updation only via owner

namespace RentNest.Application.DTOs.PropertyDtos
{
    public class UpdatePropertyDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public string? Location { get; set; }

        public string? City { get; set; }

        public decimal? PricePerNight { get; set; }

        public int? MaxGuests { get; set; }

        public string? CheckInTime { get; set; }

        public string? CheckOutTime { get; set; }

        public string? Features { get; set; }

        public bool? IsAvailable { get; set; }
    }
}
