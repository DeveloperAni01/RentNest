//interface for auth services like register, login, logout verify otp


using RentNest.Application.DTOs.AuthDtos;
using RentNest.Domain.Enums;

namespace RentNest.Application.Interfaces.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> UserRegisterAsync(RegisterDto registerDto, UserRole role);
        Task<AuthResponseDto> UserLoginAsync(LoginDto loginDto);
        Task UserLogoutAsync(string userId);
        Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
        Task VerifyUserEmailAsync(VerifyOtpDto verifyOtpDto);
        Task ResendOtpAsync(ResendOtpDto resendOtpDto);

        



        
    }
}
