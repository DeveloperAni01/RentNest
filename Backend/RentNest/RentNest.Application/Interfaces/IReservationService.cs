//interface for Reservation services defination only

using RentNest.Application.DTOs.ReservationDtos;

namespace RentNest.Application.Interfaces
{
    public interface IReservationService
    {
        Task<ReservationResponseDto> ReservationCreateAsync(CreateReversationDto createReversationDto, string renterId);
        Task<ReservationResponseDto> ReservationUpdateStatusAsync(UpdateReservationStatusDto updateReservationStatusDto, string userId);
        Task<List<ReservationResponseDto>> OwnerReservationsAsync(string ownerId);
        Task<ReservationResponseDto?> ReservationGetByIdAsync(int reservationId);
        Task<List<ReservationResponseDto>> RenterReservationsAsync(string renterId);
    }
}
