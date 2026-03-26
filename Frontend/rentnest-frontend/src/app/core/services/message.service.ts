import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/apiResponse.model';
import { Message, SendMessageRequest } from '../../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = `${environment.messagingUrl}/messages`;

  constructor(private http: HttpClient) {}

  sendMessage(data: SendMessageRequest): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.apiUrl}`, data);
  }

  getConversation(userId: string): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/conversation/${userId}`);
  }

  getAllMessages(): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}`);
  }

  markAsRead(messageId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${messageId}/read`, {});
  }
}
