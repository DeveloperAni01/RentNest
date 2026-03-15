using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RentNest.Application.DTOs.AuthDtos;
using RentNest.Application.Interfaces.Auth;
using RentNest.Domain.Entities;
using RentNest.Domain.Enums;
using RentNest.Infrastructure.Data;
using RentNest.Infrastructure.Exceptions;
using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Xml.Linq;
//implemention of IAuthService
namespace RentNest.Infrastructure.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IPasswordService _passwordService;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;

        public AuthService(AppDbContext context, IConfiguration config, IPasswordService password,IEmailService email,ITokenService token)
        {
            _context = context;
            _config = config;
            _emailService = email;
            _passwordService = password;
            _tokenService = token;


        }

        private static string GnerateFullName(string fName,string? mName,string? lName)
        {
            var names = new[] { fName, mName, lName }
                .Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(" ", names);
        }

        private static string OtpGenerate()
        {
            var otp = new Random(Guid.NewGuid().GetHashCode());
            return otp.Next(100000, 99999).ToString();
        }

        private async Task<string> CustomUserIdGenerateAsync()
        {
            var lastUser = await _context.Users.OrderByDescending(u => u.UserId).FirstOrDefaultAsync();

            if (lastUser == null) return "USR-000001";

            int lastNumber = int.Parse(lastUser.UserId.Split('-')[1]);

            return $"USR-{(lastNumber + 1):D6}";
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (currentUser == null) throw new UnAuthorized("RefreshToken is not valid");
            if (currentUser.RefreshTokenExpiiry == null) throw new UnAuthorized("Please Log in Aagain");

            string newAccessToken = _tokenService.AccessTokenGeneration(currentUser);
            string newRefreshToken = _tokenService.RefreshTokenGeneration();
            var newExpiry = DateTime.UtcNow.AddDays(int.Parse(_config["JWTSettings:RefreshTokenExpiryDays"] ?? "7"));

            currentUser.RefreshToken = newRefreshToken;
            currentUser.RefreshTokenExpiiry = newExpiry;

            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                UserId = currentUser.UserId,
                FullName = GnerateFullName(currentUser.FirstName, currentUser.MiddleName, currentUser.LastName),
                Email = currentUser.Email,
                IsEmailVerified = currentUser.IsEmailVerified,
                IsOwner = currentUser.IsOwner,
                Role = currentUser.Role.ToString(),
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_config["JWTSettings:TokenExpiryMinutes"] ?? "60")),
                Message = "Successfully refreshed token"
            };
        }

        public async Task ResendOtpAsync(ResendOtpDto resendOtpDto)
        {
            var curentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == resendOtpDto.Email);

            if (curentUser == null) throw new NotFound($"{resendOtpDto.Email} not found!");
            if (curentUser.IsEmailVerified) throw new BadRequest("Email already verified, please login!");

            string newOtp = OtpGenerate();
            curentUser.Otp = newOtp;
            curentUser.OtpExpiiry = DateTime.UtcNow.AddMinutes(10);

            await _context.SaveChangesAsync();

            string fullName = GnerateFullName(curentUser.FirstName, curentUser.MiddleName, curentUser.LastName);
            await _emailService.OtpSendToEmailAsync(curentUser.Email, curentUser.Otp, fullName);

        }

        public async Task<AuthResponseDto> UserLoginAsync(LoginDto loginDto)
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (currentUser == null) throw new NotFound("User not found! please register");
            if (!currentUser.IsEmailVerified) throw new UnAuthorized("Please verify your email before login");
            if (!currentUser.IsActive) throw new UnAuthorized("User is not Active");

            if (!_passwordService.VerifyUserPassword(loginDto.Password, currentUser.HashedPassword)) throw new UnAuthorized("Invalid Crediantials");

            string newAccessToken = _tokenService.AccessTokenGeneration(currentUser);
            string newRefreshToken = _tokenService.RefreshTokenGeneration();
            var newExpiry = DateTime.UtcNow.AddDays(int.Parse(_config["JWTSettings:RefreshTokenExpiryDays"] ?? "7"));

            currentUser.RefreshToken = newRefreshToken;
            currentUser.RefreshTokenExpiiry = newExpiry;
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] : {currentUser.Email} User logged in");

            return new AuthResponseDto
            {
                UserId = currentUser.UserId,
                FullName = GnerateFullName(currentUser.FirstName, currentUser.MiddleName, currentUser.LastName),
                Email = currentUser.Email,
                IsEmailVerified = currentUser.IsEmailVerified,
                IsOwner = currentUser.IsOwner,
                Role = currentUser.Role.ToString(),
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_config["JWTSettings:TokenExpiryMinutes"] ?? "60")),
                Message = "Login Successful"
            };
        }

        public async Task UserLogoutAsync(string userId)
        {
            var currentUser = await _context.Users.FindAsync(userId);

            if (currentUser == null) throw new NotFound($"{userId} not found");
            currentUser.RefreshToken = "";
            currentUser.RefreshTokenExpiiry = null;

            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO : {currentUser.Email} User logged out");
        }

        public async Task<AuthResponseDto> UserRegisterAsync(RegisterDto registerDto, UserRole role)
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (currentUser == null) throw new Conflict($"{registerDto.Email} already registered!");

            string newId = await CustomUserIdGenerateAsync();
            string otp = OtpGenerate();
            DateTime otpExpiry = DateTime.UtcNow.AddMinutes(10);

            var newUser = new User{

                UserId = newId,
                FirstName = registerDto.FirstName.Trim(),
                MiddleName = registerDto.MiddleName?.Trim() ?? string.Empty,
                LastName = registerDto.LastName?.Trim() ?? string.Empty,
                Email = registerDto.Email.ToLower().Trim(),
                HashedPassword = _passwordService.PasswordHashing(registerDto.Password),
                PhoneNumber = registerDto.PhoneNumber?.Trim() ?? string.Empty,
                Gender = registerDto.Gender?.Trim() ?? string.Empty,
                Role = role,
                IsOwner = false,
                IsEmailVerified = false,
                IsActive = true,
                Otp = otp,
                OtpExpiiry = otpExpiry,
                CreatedAt = DateTime.UtcNow
            };
            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO]: {newUser.Email} registered with role : {role}");

            string fullName = GnerateFullName(newUser.FirstName, newUser.MiddleName, newUser.LastName);
            await _emailService.OtpSendToEmailAsync(newUser.Email, fullName, otp);


            return new AuthResponseDto
            {
                UserId = newUser.UserId,
                FullName = fullName,
                Email = newUser.Email,
                IsEmailVerified = newUser.IsEmailVerified,
                IsOwner = newUser.IsOwner,
                Role = newUser.Role.ToString(),
                AccessToken = "",
                RefreshToken = "",
                ExpiresAt = null,
                Message = "Registration Successful"
            };
        }

        public async Task VerifyUserEmailAsync(VerifyOtpDto verifyOtpDto)
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == verifyOtpDto.Email);
            if (currentUser == null) throw new NotFound($"{currentUser?.Email} not found!");
            if (currentUser.Otp != verifyOtpDto.Otp) throw new BadRequest("Invalid Otp");
            if (currentUser.OtpExpiiry > DateTime.UtcNow) throw new BadRequest("Otp Expired");
            currentUser.IsEmailVerified = true;
            currentUser.Otp = "";
            currentUser.OtpExpiiry = null;
            await _context.SaveChangesAsync();

            Console.WriteLine($"[INFO] : {currentUser.Email} verified");

        }

    }
}


