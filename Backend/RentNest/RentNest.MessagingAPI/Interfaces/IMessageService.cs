using RentNest.MessagingAPI.DTOs;

namespace RentNest.MessagingAPI.Interfaces
{
    public interface IMessageService
    {
        public Task<MessageResponseDto> MessageSendingAsync(SendMessageDto sendMessageDto, string senderId, string senderName);//for message sennding service

        public Task<List<MessageResponseDto>> ConversationAsync(string userID1, String userID2); //CONVERSATIONN BETWEEN TWO USERS.

        public Task<List<MessageResponseDto>> AllConversationAsync(string userID); //all messages for users

        public Task MarkReadMessag(int msgId, string UserID);

    }
}
