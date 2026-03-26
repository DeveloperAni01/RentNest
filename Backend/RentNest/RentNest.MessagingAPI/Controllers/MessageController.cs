using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentNest.MessagingAPI.DTOs;
using RentNest.MessagingAPI.Services;
using System.Security.Claims;

namespace RentNest.MessagingAPI.Controllers
{
    [Route("api/v1/rent-nest/messages")]
    [ApiController]
    [Authorize(Policy = "AllUsers")]
    public class MessageController : ControllerBase
    {
        private readonly MessageService _msgService;
        private readonly ILogger<MessageController> _logger;

        public MessageController(MessageService messageService, ILogger<MessageController> logger)
        {
            _msgService = messageService;
            _logger = logger;
        }

        //POST ===> FOR SENDING MESSAGES 

        [HttpPost]
        public async Task<IActionResult> SendMessage(SendMessageDto dto)
        {
            string? senderId = User.FindFirstValue("userId");
            string? senderName = User.FindFirstValue(ClaimTypes.Name)?? User.FindFirstValue("name")?? User.FindFirstValue("fullName")?? User.FindFirstValue("unique_name")?? "Unknown";

            if (string.IsNullOrEmpty(senderId))return Unauthorized();

            _logger.LogInformation("SendMessage: senderId={SenderId}, senderName={SenderName}", senderId, senderName);

            var result = await _msgService.MessageSendingAsync(dto, senderId, senderName);

            return StatusCode(201, new
            {
                Success = true,
                StatusCode = 201,
                Message = "Message sent successfully!",
                Data = result
            });
        }

        // GET request for getting user conversation
        [HttpGet("conversation/{UserID2}")]
        public async Task<IActionResult> GetConversation(string UserID2)
        {
            string? userId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId))  return Unauthorized();

            var result = await _msgService.ConversationAsync(userId, UserID2);

            return Ok(new
            {
                Success = true,
                StatusCode = 200,
                Message = "Conversation successfully retrieved !",
                Data = result
            });
        }

     
        [HttpGet]
        public async Task<IActionResult> GetUserMessage()
        {
            var userId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _msgService.AllConversationAsync(userId);

            return Ok(new
            {
                Success = true,
                StatusCode = 200,
                Message = "Messages  successfully etrieved",
                Data = result
            });
        }

        [HttpPut("{messageId}/read")]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            string? userId = User.FindFirstValue("userId");

            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _msgService.MarkReadMessag(messageId, userId);

            return Ok(new
            {
                Success = true,
                StatusCode = 200,
                Message = "Message marked as read!",
                Data = (object?)null
            });
        }
    }
}
