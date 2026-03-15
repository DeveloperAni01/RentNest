//for search functionalities we need this dto to create search operation

namespace RentNest.Application.DTOs.PropertyDtos
{
    public class SearchPropertyDto
    {
        public string? City { get; set; }

        public string? PropertyType { get; set; }

        public DateTime? CheckInDate { get; set; }

        public DateTime? CheckOutDate { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }

        public int? MaxGuests { get; set; }

        public string? Feature { get; set; }
    }
}
