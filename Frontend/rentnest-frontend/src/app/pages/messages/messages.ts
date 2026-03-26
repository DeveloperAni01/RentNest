import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageService as PrimeMessageService } from 'primeng/api';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../models/message.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    BadgeModule,
    ScrollPanelModule,
  ],
  template: `
    <div class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">Messages</h2>

      <div class="flex gap-4 h-96">
        <!-- Conversations List -->
        <div class="w-64 shrink-0">
          <p-card styleClass="h-full">
            <div class="flex flex-col gap-2">
              <div
                *ngIf="conversations.length === 0"
                class="text-center text-gray-500 text-sm py-4"
              >
                No conversations yet
              </div>
              <div
                *ngFor="let conv of conversations"
                class="flex flex-col gap-1 p-2 rounded cursor-pointer hover:bg-gray-100"
                [class.bg-blue-50]="selectedUserId === conv.userId"
                (click)="selectConversation(conv.userId, conv.userName)"
              >
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-sm">{{ conv.userName }}</span>
                  <p-badge
                    *ngIf="conv.unreadCount > 0"
                    [value]="conv.unreadCount.toString()"
                    severity="danger"
                  />
                </div>
                <span class="text-xs text-gray-400 truncate">{{ conv.lastMessage }}</span>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Chat Window -->
        <div class="flex-1 flex flex-col">
          <p-card styleClass="h-full flex flex-col">
            <!-- No conversation selected -->
            <div
              *ngIf="!selectedUserId"
              class="flex items-center justify-center h-full text-gray-400"
            >
              <div class="text-center">
                <i class="pi pi-comments text-5xl mb-3 block"></i>
                <p>Select a conversation</p>
              </div>
            </div>

            <!-- Chat -->
            <div *ngIf="selectedUserId" class="flex flex-col h-full gap-3">
              <div class="font-semibold border-b pb-2">{{ selectedUserName }}</div>

              <!-- Messages -->
              <p-scrollpanel styleClass="flex-1 h-64">
                <div class="flex flex-col gap-2 p-2">
                  <div
                    *ngFor="let msg of currentMessages"
                    class="flex"
                    [class.justify-end]="msg.senderId === currentUserId"
                    [class.justify-start]="msg.senderId !== currentUserId"
                  >
                    <div
                      class="max-w-xs px-3 py-2 rounded-xl text-sm"
                      [style.background]="
                        msg.senderId === currentUserId ? 'var(--primary)' : 'var(--card-bg)'
                      "
                      [style.color]="msg.senderId === currentUserId ? 'white' : 'var(--text)'"
                    >
                      {{ msg.content }}
                    </div>
                  </div>
                </div>
              </p-scrollpanel>

              <!-- Input -->
              <div class="flex gap-2 mt-auto">
                <input
                  pInputText
                  [(ngModel)]="newMessage"
                  placeholder="Type a message..."
                  class="flex-1"
                  (keyup.enter)="sendMessage()"
                />
                <p-button icon="pi pi-send" (click)="sendMessage()" />
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
})
export class MessagesComponent implements OnInit {
  conversations: any[] = [];
  currentMessages: Message[] = [];
  selectedUserId = '';
  selectedUserName = '';
  newMessage = '';
  currentUserId = '';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private primeMessageService: PrimeMessageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.loadAllMessages();

    // auto open conversation if coming from property detail
    const userId = this.route.snapshot.queryParams['userId'];
    const userName = this.route.snapshot.queryParams['userName'];
    if (userId && userName) {
      this.selectConversation(userId, userName);
    }
  }

  loadAllMessages() {
    this.messageService.getAllMessages().subscribe({
      next: (res) => {
        if (res.success) {
          this.buildConversations(res.data);
        }
      },
      error: () => {},
    });
  }

  buildConversations(messages: Message[]) {
    const convMap = new Map<string, any>();
    const currentId = this.currentUserId;

    messages.forEach((msg) => {
      const otherId = msg.senderId === currentId ? msg.receiverId : msg.senderId;
      const otherName = msg.senderId === currentId ? msg.receiverName : msg.senderName;

      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          userId: otherId,
          userName: otherName,
          lastMessage: msg.content,
          sentAt: msg.sentAt,
          unreadCount: 0,
        });
      }

      if (msg.senderId !== currentId && !msg.isRead) {
        convMap.get(otherId).unreadCount++;
      }
    });

    this.conversations = Array.from(convMap.values());
  }

  selectConversation(userId: string, userName: string) {
    this.selectedUserId = userId;
    this.selectedUserName = userName;
    this.loadConversation(userId);
  }

  loadConversation(userId: string) {
    this.messageService.getConversation(userId).subscribe({
      next: (res) => {
        if (res.success) {
          this.currentMessages = res.data;
          this.markMessagesAsRead();
        }
      },
      error: () => {},
    });
  }

  markMessagesAsRead() {
    this.currentMessages
      .filter((m) => m.senderId !== this.currentUserId && !m.isRead)
      .forEach((m) => this.messageService.markAsRead(m.messageId).subscribe());
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messageService
      .sendMessage({
        receiverId: this.selectedUserId,
        receiverName: this.selectedUserName,
        content: this.newMessage,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.newMessage = '';
            this.loadConversation(this.selectedUserId);
            this.loadAllMessages();
          }
        },
        error: (err) => {
          this.primeMessageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to send message',
          });
        },
      });
  }
}
