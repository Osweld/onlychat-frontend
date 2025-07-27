import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { signal, computed } from '@angular/core';
import {
  ChatMessageSeen,
  RecieveChatMessage,
  SendChatMessage,
} from '../interfaces/chat.interface';
import * as SockJSModule from 'sockjs-client';

const SockJS = (url: string) => {
  (window as any).global = window;
  return new SockJSModule.default(url);
};

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client!: Client;
  private subscriptions = new Map<number, StompSubscription>();

  private connectionStatus = signal<boolean>(false);
  public isConnected = this.connectionStatus.asReadonly();

  private messagesSignal = signal<RecieveChatMessage[]>([]);
  private MessageNotification = signal<RecieveChatMessage[]>([]);
  public messages = computed(() => this.messagesSignal());

  public getRealtimeMessages = computed(() => this.messagesSignal());
  public getMessageNotification = computed(() => this.MessageNotification());

  public getMessagesForChat = (chatId: number) =>
    computed(() =>
      this.messagesSignal().filter((msg) => msg.chatId === chatId)
    );

  constructor() {}

  private setupStompClient() {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.error('Cannot setup WebSocket: No authentication token found');
      return false;
    }

    try {
      this.client = new Client({
        webSocketFactory: () => SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (msg) => console.log('STOMP:', msg),
      });

      this.client.onConnect = (frame) => {
        console.log('Connected to WebSocket server:', frame);
        this.connectionStatus.set(true);
        const currentUsername = localStorage.getItem('username');
        if (!currentUsername) {
          console.error('No username found in local storage');
          return;
        }

        if (currentUsername) {
          this.client.subscribe(`/user/queue/errors`, (message) => {
            console.log(message);
          });

          this.client.subscribe(`/user/queue/messages`, (message) => {
            try {
              const chatMessage: RecieveChatMessage = JSON.parse(message.body);
              const isDuplicate = this.messagesSignal().some(
                (msg) => msg.id === chatMessage.id
              );
              if (!isDuplicate) {
                this.MessageNotification.update((prev) => [
                  ...prev,
                  chatMessage,
                ]);
              }
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          });

          this.client.subscribe(`/user/queue/message-seen`, (message) => {
            try {

              const chatMessageSeen: ChatMessageSeen = JSON.parse(message.body);
             this.messagesSignal.update(prevMessages =>
                prevMessages.map(msg =>
                  msg.chatId === chatMessageSeen.chatId && msg.senderId !== chatMessageSeen.userId
                    ? { ...msg, isRead: true }
                    : msg
                )
              );
            } catch (e) {
              console.error('Error parsing message:', e);
            }
          });
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

      return true;
    } catch (error) {
      console.error('Error setting up STOMP client:', error);
      return false;
    }
  }

  connect() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('Cannot connect WebSocket: No authentication token found');
      return false;
    }

    if (!this.client) {
      if (!this.setupStompClient()) {
        return false;
      }
    }

    if (!this.client.active) {
      try {
        this.client.activate();
        return true;
      } catch (error) {
        console.error('Error activating WebSocket client:', error);
        return false;
      }
    }

    return true;
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
  }

  clearGlobalNotifications() {
    this.MessageNotification.set([]);
  }

  getAndClearGlobalNotifications(): RecieveChatMessage[] {
    const notifications = this.MessageNotification();
    this.MessageNotification.set([]);
    return notifications;
  }
}
