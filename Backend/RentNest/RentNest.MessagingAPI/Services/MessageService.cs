using Microsoft.EntityFrameworkCore;
using RentNest.MessagingAPI.Data;
using RentNest.MessagingAPI.DTOs;
using RentNest.MessagingAPI.Interfaces;
using RentNest.MessagingAPI.Model;

namespace RentNest.MessagingAPI.Services
{
    public class MessageService : IMessageService
    {

        private readonly AppDbContext _msgContext;

        public MessageService(AppDbContext context)
        {
            _msgContext = context;
        }

        //helper function..

        private static MessageResponseDto MessageResponse(Message m) => new()
        {
            MessageId = m.MessageId,
            SenderId = m.SenderId,
            SenderName = m.SenderName,
            ReceiverId = m.ReceiverId,
            ReceiverName = m.ReceiverName,
            Content = m.Content,
            IsRead = m.IsRead,
            SentAt = m.SentAt
        };

        public async Task<List<MessageResponseDto>> AllConversationAsync(string userID)
        {
            var messages = await _msgContext.Messages.Where(m => m.SenderId == userID || m.ReceiverId == userID).OrderByDescending(m => m.SentAt).ToListAsync();

            return messages.Select(MessageResponse).ToList();
        }

        public async Task<List<MessageResponseDto>> ConversationAsync(string userID1, string userID2)
        {
            var messages = await _msgContext.Messages
               .Where(m =>
                   (m.SenderId == userID1 && m.ReceiverId == userID2) ||
                   (m.SenderId == userID2 && m.ReceiverId == userID1))
               .OrderBy(m => m.SentAt)
               .ToListAsync();

            return messages.Select(MessageResponse).ToList();
        }

        public async Task MarkReadMessag(int msgId, string UserID)
        {
            var message = await _msgContext.Messages.FirstOrDefaultAsync(m => m.MessageId == msgId && m.ReceiverId == UserID);

            if (message == null) throw new Exception("Message Not Found!!");
         
            message.IsRead = true;
            await _msgContext.SaveChangesAsync();
        }

        public async Task<MessageResponseDto> MessageSendingAsync(SendMessageDto sendMessageDto, string senderId, string senderName)
        {
            var message = new Message
            {
                SenderId = senderId,
                SenderName = senderName,
                ReceiverId = sendMessageDto.ReceiverId,
                ReceiverName = sendMessageDto.ReceiverName,
                Content = sendMessageDto.Content,
                IsRead = false,
                SentAt = DateTime.Now
            };

            _msgContext.Messages.Add(message);
            await _msgContext.SaveChangesAsync();

            Console.WriteLine($"[INFO] Message sent from {senderName} to {sendMessageDto.ReceiverName}");

            return MessageResponse(message);
        }
    }
}
