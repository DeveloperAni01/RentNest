//log inn dto used during user login
using System.ComponentModel.DataAnnotations;

namespace RentNest.Application.DTOs.AuthDtos
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}
