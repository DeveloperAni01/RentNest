using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentNest.Application.DTOs;
using RentNest.Application.DTOs.ReviewDtos;
using RentNest.Application.Interfaces;
using RentNest.Infrastructure.Exceptions;
using RentNest.Infrastructure.Services;
using System.Security.Claims;

namespace RentNest.API.Controllers
{
    [Route("api/v1/rent-nest/reviews")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _review;
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
        {
            _review = reviewService;
            _logger = logger;
        }

        //get for getting all useer reviews --> protected only for users

        [HttpGet("my-reviews")]
        [Authorize(Policy = "RenterOnly")]
        public async Task<IActionResult> AllMyReviews()
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id)) throw new  UnAuthorized("Unauthorized user");

            var result = await _review.RenterReviewsAsync(id);

            return Ok(new ApiResponseDto<List<ReviewResponseDto>>
            {
                Success = true,
                StatusCode = 200,
                Message = "retrived all reviews",
                Data = result
            });

        }

        //post request for create review ==> protected for only users

        [HttpPost("create-review")]
        [Authorize(Policy = "RenterOnly")]
        public async Task<IActionResult> CreateReview(CreateReviewDto createReviewDto)
        {
            var id = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(id))throw new  UnAuthorized("Not authorized for create review");

            var result = await _review.ReviewCreateAsync(createReviewDto, id);

            return StatusCode(201, new ApiResponseDto<ReviewResponseDto>
            {
                Success = true,
                StatusCode = 201,
                Data = result,
                Message = "Review added",
               
            });
        }

        //post for all properties reviews ==> public route

        [HttpGet("property/{propertyId}")]
        public async Task<IActionResult> PropertyReviews(int propertyId)
        {
            var result = await _review.PropertyReviewsAsync(propertyId);

            return Ok(new ApiResponseDto<List<ReviewResponseDto>>
            {
                StatusCode = 200,
                Success = true,
                Data = result,
                Message = "retrieve successfully.",
               
            });
        }
    }
}
