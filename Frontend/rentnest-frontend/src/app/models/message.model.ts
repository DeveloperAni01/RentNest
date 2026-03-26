export interface Message {
  messageId: number;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface SendMessageRequest {
  receiverId: string;
  receiverName: string;
  content: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  sentAt: string;
  unreadCount: number;
}
