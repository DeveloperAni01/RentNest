using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RentNest.Application.DTOs;
using RentNest.Application.DTOs.ReservationDtos;
using RentNest.Application.Interfaces;
using RentNest.Infrastructure.Exceptions;
using RentNest.Infrastructure.Services;
using System.Security.Claims;

namespace RentNest.API.Controllers
{
    [Route("api/v1/rent-nest/reservations")]
    [ApiController]
    [Authorize]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservation;
        private readonly ILogger<ReservationController> _logger;

        public ReservationController(IReservationService reservationService, ILogger<ReservationController> logger)
        {
            _reservation = reservationService;
            _logger = logger;
        }

        //post route for user create a reservation ==> protected route

        [HttpPost("create")]
        [Authorize(Policy = "RenterOnly")]
        public async Task<IActionResult> CreateReservation(CreateReversationDto createReversationDto)
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id)) throw new UnAuthorized("Logiin fiest");

            var result = await _reservation.ReservationCreateAsync(createReversationDto, id);

            return StatusCode(201, new ApiResponseDto<ReservationResponseDto>
            {
                StatusCode = 201,
                Success = true,
                Data = result,
                Message = "Reservation successfully created",

            });
        }

        //get route for user reservations --> protected route

        [HttpGet("my-reservations")]
        [Authorize(Policy = "RenterOnly")]
        public async Task<IActionResult> MyReservations()
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id))
                return Unauthorized();

            var result = await _reservation.RenterReservationsAsync(id);

            return Ok(new ApiResponseDto<List<ReservationResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Data = result,
                Message = "reservations retrieved successfully.",

            });
        }

        //put route for status change

        [HttpPut("status")]
        public async Task<IActionResult> ReservationStatusUpdate(UpdateReservationStatusDto updateReservationStatusDto)
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id)) throw new UnAuthorized("unauthorize request");

            var result = await _reservation.ReservationUpdateStatusAsync(updateReservationStatusDto, id);

            return Ok(new ApiResponseDto<ReservationResponseDto>
            {
                StatusCode = 200,
                Success = true,
                Message = "Reservation status updated successfully.",
                Data = result
            });
        }

        // GET route for get all reservations on their properties ==> owner only

        [HttpGet("owner-reservations")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> OwnerReservations()
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id))
                return Unauthorized();

            var result = await _reservation.OwnerReservationsAsync(id);

            return Ok(new ApiResponseDto<List<ReservationResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Message = "Reservations retrieved successfully.",
                Data = result
            });



        }

        // GET user resrvation only for reenters
        [HttpGet("{id}")]
        [Authorize(Policy = "AllUsers")]
        public async Task<IActionResult> GetReservationById(int id)
        {
            //var userId = User.FindFirstValue("userId");

            //var result = await _reservation.ReservationGetByIdAsync(id);

            //if (result == null) throw new NotFound("user not found");

            //if (result.UserId != userId) throw new UnAuthorized("You are not authorized to view this reservation");
            var result = await _reservation.ReservationGetByIdAsync(id);

            if (result == null) throw new NotFound("user not found");
               

            return Ok(new ApiResponseDto<ReservationResponseDto>
            {
                Success = true,
                StatusCode = 200,
                Message = "Reservation successfully retrieved",
                Data = result
            });
        }
    }
}
