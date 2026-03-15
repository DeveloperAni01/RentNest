//create review dto mandetory fields to have to create a review

using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.ReviewDtos
{
    public class CreateReviewDto
    {
        [Required]
        public int ReservationId { get; set; }

        [Required]
        public int PropertyId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
    }
}
