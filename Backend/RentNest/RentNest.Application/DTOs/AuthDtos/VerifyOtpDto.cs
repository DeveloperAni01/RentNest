//verify dto used during verify otp of ann user

using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.AuthDtos
{
    public class VerifyOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MaxLength(6)]
        public string Otp { get; set; } = string.Empty;
    }
}
