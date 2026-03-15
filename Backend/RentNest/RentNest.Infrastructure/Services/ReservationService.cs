using Microsoft.EntityFrameworkCore;
using RentNest.Application.DTOs.PropertyDtos;
using RentNest.Application.DTOs.ReservationDtos;
using RentNest.Application.Interfaces;
using RentNest.Application.Interfaces.Auth;
using RentNest.Domain.Entities;
using RentNest.Domain.Enums;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Services
{
    public class ReservationService : IReservationService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _email;
     

        public ReservationService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _email = emailService;
        }

        private static ReservationResponseDto ResponseDto(Reservation r, User renter, Property p) => new()
        {
            PropertyId = r.PropertyId,
            PropertyTitle = p.Title,
            ReservationId = r.ReservationId,
            RenterName = $"{renter.FirstName} {renter.LastName}".Trim(),
            UserId = r.UserId,
            BookedAt = r.BookedAt,
            CheckInDate = r.CheckInDate,
            CheckOutDate = r.CheckOutDate,
            PropertyCity = p.City,
            PaymentStatus = r.PaymentStatus,
            ReservationStatus = r.ReservationStatus.ToString(),
            TotalAmount = r.TotalAmount,
            TotalNights = (r.CheckOutDate - r.CheckInDate).Days
           
        };
        public async Task<List<ReservationResponseDto>> OwnerReservationsAsync(string ownerId)
        {
            var reservations = await _context.Reservations.Include(r => r.User).Include(r => r.Property).Where(r => r.Property.OwnerId == ownerId).OrderByDescending(r => r.BookedAt).ToListAsync();
            if (reservations == null) throw new NotFound("No reservations found");

            foreach (var reservation in reservations)
            {
                if (reservation.CheckOutDate < DateTime.UtcNow.Date &&
                    reservation.ReservationStatus == ReservationStatus.Confirmed)
                {
                    reservation.ReservationStatus = ReservationStatus.Completed;
                }
            }
            await _context.SaveChangesAsync();

            return reservations.Select(r => ResponseDto(r, r.User, r.Property)).ToList();
        }

        public async Task<List<ReservationResponseDto>> RenterReservationsAsync(string renterId)
        {
            var reservations = await _context.Reservations.Include(r => r.User).Include(r => r.Property).Where(r => r.UserId == renterId).OrderByDescending(r => r.BookedAt).ToListAsync();

            
            foreach (var reservation in reservations)
            {
                //whenever the check out date will over automatic status update by system
                if (reservation.CheckOutDate < DateTime.UtcNow.Date &&reservation.ReservationStatus == ReservationStatus.Confirmed)
                {
                    reservation.ReservationStatus = ReservationStatus.Completed;
                }
            }

            await _context.SaveChangesAsync();

            return reservations.Select(r => ResponseDto(r, r.User, r.Property)).ToList();
        }

        public async Task<ReservationResponseDto> ReservationCreateAsync(CreateReversationDto createReversationDto, string renterId)
        {

            var property = await _context.Properties.Include(p => p.Owner).FirstOrDefaultAsync(p => p.PropertyId == createReversationDto.PropertyId);
            if (property == null) throw new NotFound($"Property not found with property id : {createReversationDto.PropertyId}");

            if (!property.IsAvailable)throw new BadRequest("This property is not available for booking!");

           
            if (createReversationDto.CheckInDate >= createReversationDto.CheckOutDate)throw new BadRequest("Check out date must be after check in date!");

            if (createReversationDto.CheckInDate < DateTime.UtcNow.Date)throw new BadRequest("PAST CHECK INN DAT NOT ALLOWED!");

            
            var isAlreadyBooked = await _context.Reservations.AnyAsync(r =>r.PropertyId == createReversationDto.PropertyId && r.ReservationStatus == ReservationStatus.Confirmed && r.CheckInDate < createReversationDto.CheckOutDate &&r.CheckOutDate > createReversationDto.CheckInDate);

            if (isAlreadyBooked)throw new BadRequest("Porperty is not available for these datee");

          
            int totalDays = (createReversationDto.CheckOutDate - createReversationDto.CheckInDate).Days;
            decimal totalAmount = totalDays * property.PricePerNight;


            var renter = await _context.Users.FindAsync(renterId);
                if(renter == null) throw new NotFound($"Renter not founnd wiith renterId: {renterId}");

          
            var newReservarion = new Reservation
            {
                UserId = renterId,
                PropertyId = createReversationDto.PropertyId,
                CheckInDate = createReversationDto.CheckInDate,
                CheckOutDate = createReversationDto.CheckOutDate,
                TotalAmount = totalAmount,
                ReservationStatus = ReservationStatus.Pending,
                PaymentStatus = "Pending",
                BookedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(newReservarion);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] new eservation created with iid {newReservarion.ReservationId} by Renter: {renterId}");

            var renterName = $"{renter.FirstName} {renter.LastName}".Trim();

          

            return ResponseDto(newReservarion, renter, property);
        }

        public async Task<ReservationResponseDto?> ReservationGetByIdAsync(int reservationId)
        {
            var reservation = await _context.Reservations.Include(r => r.User).Include(r => r.Property).FirstOrDefaultAsync(r => r.ReservationId == reservationId);
            if (reservation == null) throw new NotFound($"Reservation not found! with iid : {reservationId}");

            return ResponseDto(reservation, reservation.User, reservation.Property);

        }

        public async Task<ReservationResponseDto> ReservationUpdateStatusAsync(UpdateReservationStatusDto updateReservationStatusDto, string userId)
        {
            var reservation = await _context.Reservations.Include(r => r.User).Include(r => r.Property).FirstOrDefaultAsync(r => r.ReservationId == updateReservationStatusDto.ReservationId);

            if (reservation == null) throw new NotFound($"reservatio not found with id: {updateReservationStatusDto.ReservationId}");

            bool isOwner = reservation.Property.OwnerId == userId;

            bool isRenter = reservation.UserId == userId;
            

            if (!isRenter && !isOwner) throw new UnAuthorized("Not Uthothized");

            
            if (isRenter && updateReservationStatusDto.Status != "Cancelled") throw new BadRequest(" invalid operation ");

            if (isOwner && updateReservationStatusDto.Status != "Confirmed" && updateReservationStatusDto.Status != "Cancelled" && updateReservationStatusDto.Status != "Completed") throw new BadRequest("Invalid Status operation!");

           
            if (!Enum.TryParse<ReservationStatus>(updateReservationStatusDto.Status, out var newStatus))throw new BadRequest("reservation status invalid!");

            reservation.ReservationStatus = newStatus;
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] Reservation {reservation.ReservationId} status updated to {updateReservationStatusDto.Status} and update by user with userid: {userId}");


            return ResponseDto(reservation, reservation.User, reservation.Property);
        }
    }
}
