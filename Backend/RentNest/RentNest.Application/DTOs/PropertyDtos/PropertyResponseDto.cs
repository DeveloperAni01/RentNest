//customize response for send property details to user

namespace RentNest.Application.DTOs.PropertyDtos
{
    public class PropertyResponseDto
    {
        public int PropertyId { get; set; }

        public string OwnerId { get; set; } = string.Empty;

        public string OwnerName { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string PropertyType { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public decimal PricePerNight { get; set; }

        public int MaxGuests { get; set; }

        public string CheckInTime { get; set; } = string.Empty;

        public string CheckOutTime { get; set; } = string.Empty;

        public string Features { get; set; } = string.Empty;

        public bool IsAvailable { get; set; }

        public decimal Rating { get; set; }

        public DateTime CreatedAt { get; set; }

        public List<string> Images { get; set; } = new();
    }
}
