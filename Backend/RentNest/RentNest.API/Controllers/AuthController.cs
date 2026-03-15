using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RentNest.Application.DTOs;
using RentNest.Application.DTOs.AuthDtos;
using RentNest.Application.Interfaces.Auth;
using RentNest.Domain.Enums;
using RentNest.Infrastructure.Services.Auth;
using System.Security.Claims;

namespace RentNest.API.Controllers
{
    [Route("api/v1/rent-nest/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _auth = authService;
            _logger = logger;
        }

        //POST route --> for user registration

        [HttpPost("signup-user")]
        public async Task<IActionResult> UserRegistration(RegisterDto register)
        {
            var result = await _auth.UserRegisterAsync(register, UserRole.Renter);

            return StatusCode(201, new ApiResponseDto<AuthResponseDto>
            {
                StatusCode = 201,
                Success = true,
                Data = result,
                Message = "User successfully registered. now please verigy your otp"
            });
        }

        //post route ==> user login

        [HttpPost("signin-user")]
        public async Task<IActionResult> UserLogin(LoginDto loginDto)
        {
            var result = await _auth.UserLoginAsync(loginDto);

            return Ok(new ApiResponseDto<AuthResponseDto>
            {
                StatusCode = 200,
                Success = true,
                Data = result,
                Message = "User successfully signed in"
            });
        }

        //post ==> user logout //protected route

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> LogoutUser()
        {
            string? userId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _auth.UserLogoutAsync(userId);

            return Ok(new ApiResponseDto<object>
            {
                StatusCode = 200,
                Success = true,
                Data = null,
                Message = "User successfully loged out"
            });
        }

        //post for verify otp

        [HttpPost("verify-otp")]
        public async Task<IActionResult> UserOtpVerification(VerifyOtpDto verifyOtpDto)
        {
            await _auth.VerifyUserEmailAsync(verifyOtpDto);

            return Ok(new ApiResponseDto<object>
            {
                StatusCode = 200,
                Success = true,
                Data = null,
                Message = "Emain is verifiied now signin"
            });
        }

        //post for resend otp

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp(ResendOtpDto resendOtpDto)
        {
            await _auth.ResendOtpAsync(resendOtpDto);
            return Ok(new ApiResponseDto<object>{
                StatusCode = 200,
                Success = true,
                Data = null,
                Message = "Otp sent to your email"
            });
        }

        //post for owner restrationn

        [HttpPost("signup-owner")]
        public async Task<IActionResult> OwnerRegistration(RegisterDto registerDto)
        {
            var result = await _auth.UserRegisterAsync(registerDto, UserRole.Owner);

            return StatusCode(201, new ApiResponseDto<AuthResponseDto>
            {
                StatusCode = 201,
                Success = true,
                Data = result,
                Message = "owner successfully registered. now please verify your otp and wait for admin approval"
            });

        }

        //post for refreshtokken

        [HttpPost("refreshtoken")]
        public async Task<IActionResult> AuthTokenRefresh([FromBody] string token)
        {
            var result = await _auth.RefreshTokenAsync(token);

            return Ok(new ApiResponseDto<object>
            {
                Success = true,
                StatusCode = 200,
                Message = "Token refreshed successfully.",
                Data = result
            });
        }
    }
}
