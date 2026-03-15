//during property creation we need must field to create

using RentNest.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.PropertyDtos
{
    public class CreatePropertyDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public PropertyType PropertyType { get; set; }

        [Required]
        public string Location { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public decimal PricePerNight { get; set; }

        [Required]
        public int MaxGuests { get; set; }

        [Required]
        public string CheckInTime { get; set; } = string.Empty;

        [Required]
        public string CheckOutTime { get; set; } = string.Empty;

        public string Features { get; set; } = string.Empty;
    }
}
