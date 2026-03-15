using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RentNest.Application.DTOs;
using RentNest.Application.Interfaces.Auth;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace RentNest.API.Controllers
{
    [Route("api/v1/rent-nest/super-admin")]
    [ApiController]
    [Authorize(Policy = "SuperAdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AdminController(AppDbContext context, ILogger<AuthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        //put route for owner approve

        [HttpPut("owners/{userId}/approve")]
        public async Task<IActionResult> OwnerApproval(string userId)
        {
            var owner = await _context.Users.FindAsync(userId);
            if (owner == null) throw new NotFound($"user not found wiith id : {userId}");

            if (owner.Role != Domain.Enums.UserRole.Owner) throw new BadRequest("user is not an owner");

            if (owner.IsOwner) throw new BadRequest("already approved");

            string fullName = $"{owner.FirstName} {owner.LastName}".Trim();


            owner.IsOwner = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Approved owner with: {UserId}", userId);


            return Ok(new ApiResponseDto<object>
            {
                StatusCode = 200,
                Success = true,
                Message = $"{fullName} is now owner",
                Data = null
            });
        }

        //put route for owner enable

        [HttpPut("owners/{userId}/enable")]
        public async Task<IActionResult> EnableOwner(string userId)
        {
            var owner = await _context.Users.FindAsync(userId);
            if (owner == null) throw new NotFound($"user not found wiith id : {userId}");

            if (owner.Role != Domain.Enums.UserRole.Owner) throw new BadRequest("user is not an owner");
            if (owner.IsActive) throw new BadRequest("user is active");

            owner.IsActive = true;
            await _context.SaveChangesAsync();

            string fullName = $"{owner.FirstName} {owner.LastName}".Trim();

            _logger.LogInformation($"owner : ownerid = {owner.UserId} is now active");

            return Ok(new ApiResponseDto<object>
            {
                StatusCode = 200,
                Success = true,
                Message = $"{fullName} is now enabled",
                Data = null
            });

        }
        //put route for owner disable

        [HttpPut("owners/{userId}/disable")]
        public async Task<IActionResult> OwnerDisable(string userId)
        {
            var owner = await _context.Users.FindAsync(userId);
            if (owner == null) throw new NotFound($"user not found wiith id : {userId}");

            if (owner.Role != Domain.Enums.UserRole.Owner) throw new BadRequest("user is not an owner");
            if (owner.IsActive) throw new BadRequest("user is already disabled");

            owner.IsActive = false;
            await _context.SaveChangesAsync();

            string fullName = $"{owner.FirstName} {owner.LastName}".Trim();

            _logger.LogInformation($"owner : ownerid = {owner.UserId} is now disabled!");

            return Ok(new ApiResponseDto<object>
            {
                StatusCode = 200,
                Success = true,
                Message = $"{fullName} is now not ann owner",
                Data = null
            });

        }

        //delete request for owner
        [HttpDelete("owners/{userId}/delete")]
        public async Task<IActionResult> OwnerDelete(string userId)
        {
            var owner = await _context.Users.FindAsync(userId);
            if (owner == null) throw new NotFound($"user not found wiith id : {userId}");

            if (owner.Role != Domain.Enums.UserRole.Owner) throw new BadRequest("user is not an owner");

            _context.Users.Remove(owner);
            await _context.SaveChangesAsync();

            _logger.LogInformation("deleted owner wiith: {UserId}", userId);

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                StatusCode = 200,
                Message = "Owner deleted successfully",
                Data = null
            });


        }

        //get request for all owners get
        [HttpGet("owners/all")]
        public async Task<IActionResult> AllOwners()
        {
            var owners = await _context.Users
                .Where(u => u.Role == Domain.Enums.UserRole.Owner)
                .Select(u => new
                {
                    u.UserId,
                    FullName = $"{u.FirstName} {u.LastName}".Trim(),
                    u.Email,
                    u.PhoneNumber,
                    u.IsOwner,
                    u.IsActive,
                    u.IsEmailVerified,
                    u.CreatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                StatusCode = 200,
                Message = "retrived all owners!",
                Data = owners
            });
        }
    }
}
