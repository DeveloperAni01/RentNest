//dto for take necessary field from user and pass it to db during registration of an user

using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.AuthDtos
{
    public class RegisterDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string? LastName { get; set; }

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
    }
}
