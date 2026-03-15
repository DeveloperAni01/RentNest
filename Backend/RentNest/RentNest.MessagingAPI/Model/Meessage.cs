using System.ComponentModel.DataAnnotations;

namespace RentNest.MessagingAPI.Model
{
    //entity for store messages 
    public class Meessage
    {
        //primary key
        [Key]
        public int MessageId { get; set; }

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [Required]
        public string ReceiverId { get; set; } = string.Empty;

        [Required]
        public string SenderName { get; set; } = string.Empty;

        [Required]
        public string ReceiverName { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
