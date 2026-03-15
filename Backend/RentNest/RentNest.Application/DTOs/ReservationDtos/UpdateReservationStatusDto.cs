//after user create reservation --> reservation status = pending  owner --> update status to confirm or cancelled or complete as well as user can cancel via this
using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.ReservationDtos
{
    public class UpdateReservationStatusDto
    {
        [Required]
        public int ReservationId { get; set; }
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
