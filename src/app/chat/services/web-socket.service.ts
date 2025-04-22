import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { signal, computed } from '@angular/core';
import { RecieveChatMessage, SendChatMessage } from '../interfaces/chat.interface';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client!: Client;
  private subscriptions = new Map<number, StompSubscription>();

  private connectionStatus = signal<boolean>(false);
  public isConnected = this.connectionStatus.asReadonly();

  private messagesSignal = signal<RecieveChatMessage[]>([]);
  public messages = computed(() => this.messagesSignal());

  public getMessagesForChat = (chatId: number) => computed(() =>
    this.messagesSignal().filter(msg => msg.chatId === chatId)
  );

  

  constructor() {
    this.setupStompClient();
  }

  private setupStompClient() {
    const token = localStorage.getItem('access_token');

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
       Authorization: `Bearer ${token}`, 
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: function(str) {
        console.log('STOMP: ' + str);
      }
    });



    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.connectionStatus.set(true);
      
      const currentUserId = localStorage.getItem('username');
      if (currentUserId) {
        this.client.subscribe(
          `/user/${currentUserId}/queue/errors`,
          (message) => {
            console.error(message.body);
          }
        );
      }
    };

    this.client.onStompError = (frame) => {
      console.error('Broker error: ' + frame.headers['message']);
      this.connectionStatus.set(false);
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      this.connectionStatus.set(false);
    };
  }

  connect() {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
    }
    this.connectionStatus.set(false);
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000); 
  }

  subscribeToChat(chatId: number) {
    if (!this.client.connected) {
      console.warn('WebSocket not connected, attempting to connect...');
      this.connect();
    }

    if (!this.subscriptions.has(chatId)) {
      const subscription = this.client.subscribe(
        `/topic/chat.${chatId}`,
        (message) => {
          try {
            const chatMessage: RecieveChatMessage = JSON.parse(message.body);
            this.messagesSignal.set([...this.messagesSignal(), chatMessage]);
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        },
        { id: `sub-chat-${chatId}` }
      );
      this.subscriptions.set(chatId, subscription);
    }
  }

  unsubscribeFromChat(chatId: number) {
    if (this.subscriptions.has(chatId)) {
      const subscription = this.subscriptions.get(chatId)!;
      subscription.unsubscribe();
      this.subscriptions.delete(chatId);
    }
  }

  sendMessage(sendMessage: SendChatMessage) {
    if (!this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat.sendMessage`,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(sendMessage),
    });
  }

  destroy() {
    this.disconnect();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }

}
