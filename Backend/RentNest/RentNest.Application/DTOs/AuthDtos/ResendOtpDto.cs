//For resend otp we need email

using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.AuthDtos
{
    public class ResendOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
