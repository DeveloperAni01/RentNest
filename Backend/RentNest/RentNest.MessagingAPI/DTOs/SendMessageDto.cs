using System.ComponentModel.DataAnnotations;

namespace RentNest.MessagingAPI.DTOs
{
    public class SendMessageDto
    {
        [Required]
        public string ReceiverId { get; set; } = string.Empty;

        [Required]
        public string ReceiverName { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;
    }
}
