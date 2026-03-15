using Microsoft.EntityFrameworkCore;
using RentNest.Application.DTOs.ReviewDtos;
using RentNest.Application.Interfaces;
using RentNest.Domain.Entities;
using RentNest.Domain.Enums;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Services
{
    //adv. feature srevice implemention i.e user reviews
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _contrext;
        public ReviewService(AppDbContext context)
        {
            _contrext = context;
        }

        //helper function
        private static ReviewResponseDto ReviewResponse(Review r, User u, Property p) => new()
        {
            ReviewId = r.ReviewId,
            PropertyId = r.PropertyId,
            PropertyTitle = p.Title,
            ReservationId = r.ReservationId,
            UserId = r.UserId,
            RenterName = $"{u.FirstName} {u.LastName}".Trim(),
            Rating = r.Rating,
            CreatedAt = r.CreatedAt
        };

        private async Task ReCalculateRating(int iid)
        {
            var averageRating = await _contrext.Reviews
                .Where(r => r.PropertyId == iid)
                .AverageAsync(r => (double)r.Rating);

            var property = await _contrext.Properties.FindAsync(iid);
            if (property != null)
            {
                property.Rating = (decimal)Math.Round(averageRating, 2);
                await _contrext.SaveChangesAsync();
            }
        }

        public async Task<List<ReviewResponseDto>> PropertyReviewsAsync(int propertyId)
        {
            var reviiews =  await _contrext.Reviews.Include(r => r.User).Include(r => r.Property).Where(r => r.PropertyId == propertyId).OrderByDescending(r => r.CreatedAt).Select(r => ReviewResponse(r, r.User, r.Property)).ToListAsync();
            if (reviiews == null) throw new NotFound("no reviiews there!");
            return reviiews;
        }

        public async Task<List<ReviewResponseDto>> RenterReviewsAsync(string renterId)
        {
            var reviews =  await _contrext.Reviews.Include(r => r.User).Include(r => r.Property).Where(r => r.UserId == renterId).OrderByDescending(r => r.CreatedAt).Select(r => ReviewResponse(r, r.User, r.Property)).ToListAsync();
            if (reviews == null) throw new NotFound("no reviiews there!");
            return reviews;
        }

        public async Task<ReviewResponseDto> ReviewCreateAsync(CreateReviewDto createReviewDto, string renterId) //renter --> complete reservation --> can give review
        {
            var reservation = await _contrext.Reservations.FirstOrDefaultAsync(r => r.ReservationId == createReviewDto.ReservationId && r.UserId == renterId);
            if (reservation == null) throw new NotFound($"reservatiion nnot found wirh revID : {createReviewDto.ReservationId}");


            if (reservation.ReservationStatus != ReservationStatus.Confirmed) throw new BadRequest("please complete your reservation before giving review!");


            bool alreadyReviewed = await _contrext.Reviews.AnyAsync(r => r.ReservationId == createReviewDto.ReservationId);

            if (alreadyReviewed) throw new Conflict("already reviewed!");


            var renter = await _contrext.Users.FindAsync(renterId);
            if (renter == null) throw new NotFound($"renter not found with id : {renterId}");



            var property = await _contrext.Properties.FindAsync(createReviewDto.PropertyId);
            if (property == null) throw new NotFound($"PROPERTY NOT FOUND WITH PROPERTYiD : {createReviewDto.PropertyId}");

            // Create review
            var review = new Review
            {
                PropertyId = createReviewDto.PropertyId,
                ReservationId = createReviewDto.ReservationId,
                UserId = renterId,
                Rating = createReviewDto.Rating,
                CreatedAt = DateTime.UtcNow
            };

            _contrext.Reviews.Add(review);
            await _contrext.SaveChangesAsync();


            await ReCalculateRating(createReviewDto.PropertyId);

            Console.WriteLine($"[INFO] Review created for property with iid: {createReviewDto.PropertyId} by renter with: {renterId}");

            return ReviewResponse(review, renter, property);
        }
    }
}
