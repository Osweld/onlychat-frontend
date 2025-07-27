import { ChatMessagePagination } from './../interfaces/chat.interface';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import {
  Chat,
  ChatList,
  RecieveChatMessage,
  SearchUserPage,
  SendChatMessage,
} from '../interfaces/chat.interface';
import { WebSocketService } from './web-socket.service';
import { catchError, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  URL: string = environment.api.baseUrl + '/v1/chat';

  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);

  private chatsSignal = signal<Chat[]>([]);
  private selectedChatIdSignal = signal<number | null>(null);
  private currentUserIdSignal = signal<number | null>(null);
  private historicalMessagesSignal = signal<RecieveChatMessage[]>([]);
  private OldMessagesSignal = signal<RecieveChatMessage[]>([]);
  private loadingChatMessagesSignal = signal<boolean>(false);
  private totalPagesMessagesSignal = signal<number>(0);
  private pageLoadMessagesSignal = signal<number>(0);
  private loadingOldMessagesSignal = signal<boolean>(false);
  private loadAllMessagesSignal = signal<boolean>(false);
  private loadOldChatMessagesSignal = signal<boolean>(false);
  private isMessageSentSignal = signal<boolean>(false);

  public chats = computed(() => this.chatsSignal());
  public selectedChatId = computed(() => this.selectedChatIdSignal());
  public selectedChat = computed(() => {
    const chatId = this.selectedChatIdSignal();
    return chatId
      ? this.chatsSignal().find((chat) => chat.id === chatId)
      : null;
  });
  public currentUserId = computed(() => this.currentUserIdSignal());

  public loadOldChatMessages = computed(() => this.loadOldChatMessagesSignal());

  public totalPagesMessages = computed(() => this.totalPagesMessagesSignal());

  public isMessageSent = computed(() => this.isMessageSentSignal());

  public pageLoadMessages = computed(() => this.pageLoadMessagesSignal());

  public loadingOldMessages = computed(() => this.loadingOldMessagesSignal());

  public loadingChatMessages = computed(() => this.loadingChatMessagesSignal());

  public loadAllMessages = computed(() => this.loadAllMessagesSignal());

  public currentChatMessages = computed(() => {
    const chatId = this.selectedChatIdSignal();
    if (!chatId) return [];

    const realtimeMessage = this.webSocketService.getMessagesForChat(chatId)();
    const historicalMessages = this.historicalMessagesSignal();
    const oldMessages = this.OldMessagesSignal();

    const messagesMap = new Map<string | number, RecieveChatMessage>();

    historicalMessages.forEach((msg) => messagesMap.set(msg.id, msg));

    oldMessages.forEach((msg) => messagesMap.set(msg.id, msg));

    realtimeMessage.forEach((msg) => messagesMap.set(msg.id, msg));

    const uniqueMessages = Array.from(messagesMap.values());

    const getTime = (date: string) => new Date(date).getTime();
    const timestampCache = new Map<RecieveChatMessage, number>();

    uniqueMessages.forEach((msg) => {
      timestampCache.set(msg, getTime(msg.timestamp));
    });

    return uniqueMessages.sort((a, b) => {
      return timestampCache.get(a)! - timestampCache.get(b)!;
    });
  });

  constructor() {
    effect(() => {
      const notifications = this.webSocketService.getMessageNotification();
      if (notifications && notifications.length > 0) {
        this.updateChatsWithNewMessages(notifications);

        this.webSocketService.clearGlobalNotifications();
      }
    });

    effect(() => {
      const messages = this.webSocketService.getRealtimeMessages();
      if (messages && messages.length > 0) {
        this.updateChatsWithNewMessages(messages);
      }
    });
  }

  private updateChatsWithNewMessages(newMessages: RecieveChatMessage[]) {
    const latestMessagesByChat = new Map<number, RecieveChatMessage>();

    newMessages.reduce((map, message) => {
      const existing = map.get(message.chatId);
      if (
        !existing ||
        new Date(message.timestamp) > new Date(existing.timestamp)
      ) {
        map.set(message.chatId, message);
      }
      return map;
    }, latestMessagesByChat);

    this.chatsSignal.update((chats) => {
      return chats
        .map((chat) => {
          const latestMessage = latestMessagesByChat.get(chat.id);
          if (!latestMessage) return chat;

          return {
            ...chat,
            lastMessage: latestMessage.message,
            lastMessageDate: new Date(latestMessage.timestamp),
            unreadCount: this.calculateUnreadCount(
              latestMessage,
              chat.unreadCount
            ),
          };
        })
        .sort((a, b) => this.compareChatsByDate(a, b));
    });
  }

  // Método helper para el ordenamiento
  private compareChatsByDate(a: Chat, b: Chat): number {
    const dateA =
      a.lastMessageDate instanceof Date
        ? a.lastMessageDate
        : new Date(a.lastMessageDate);
    const dateB =
      b.lastMessageDate instanceof Date
        ? b.lastMessageDate
        : new Date(b.lastMessageDate);
    return dateB.getTime() - dateA.getTime();
  }

  loadChats() {
    this.getChats().subscribe({
      next: (chats) => {
        this.chatsSignal.set(chats.chats);
        this.currentUserIdSignal.set(chats.id);
        this.webSocketService.connect();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  searchUser(username: string) {
    return this.http.get<SearchUserPage>(this.URL + '/search-users', {
      params: { username },
    });
  }

  createChat(username: string) {
    return this.http.post<Chat>(this.URL, { username }).pipe(
      tap((chat) => {
        this.chatsSignal.update((chats) => [...chats, chat]);
        this.selectChat(chat.id);
      }),
      catchError((error) => {
        console.error('Error creating chat:', error);
        return throwError(() => error);
      })
    );
  }

  markChatAsRead(chatId: number) {
    return this.http.post(this.URL + `/messages/mark-as-read/${chatId}`, {});
  }

  getChats() {
    return this.http.get<ChatList>(this.URL + '/user-chats');
  }

  getChatOldPaginationMessages() {
    const nextPage = this.pageLoadMessagesSignal() + 1;
    if (nextPage >= this.totalPagesMessagesSignal()) {
      this.loadAllMessagesSignal.set(true);
      return;
    }

    this.loadingOldMessagesSignal.set(true);
    this.http
      .get<ChatMessagePagination>(
        this.URL +
          `/messages/${this.selectedChatIdSignal()}?page=${nextPage}&size=25`
      )
      .subscribe({
        next: (page) => {
          this.OldMessagesSignal.update((oldMessages) => [
            ...oldMessages,
            ...page.content,
          ]);
          this.loadingOldMessagesSignal.set(false);
          this.totalPagesMessagesSignal.set(page.totalPages);
          this.pageLoadMessagesSignal.set(page.number);
          this.loadOldChatMessagesSignal.set(true);
        },
        error: (err) => {
          console.error(err);
          this.loadingOldMessagesSignal.set(false);
        },
      });
  }

  getChatMessages() {
    return this.http.get<ChatMessagePagination>(
      this.URL + `/messages/${this.selectedChatIdSignal()}?page=0&size=25`
    );
  }

  selectChat(chatId: number) {
    if (this.selectedChatIdSignal() !== chatId) {
      if (this.selectedChatIdSignal()) {
        this.webSocketService.unsubscribeFromChat(this.selectedChatIdSignal()!);
        this.historicalMessagesSignal.set([]);
      }

      this.selectedChatIdSignal.set(chatId);
      this.webSocketService.subscribeToChat(chatId);
      this.loadingChatMessagesSignal.set(true);
      this.getChatMessages().subscribe({
        next: (page) => {
          this.historicalMessagesSignal.update((history) => [
            ...history,
            ...page.content,
          ]);
          this.loadingChatMessagesSignal.set(false);
          this.totalPagesMessagesSignal.set(page.totalPages);
          this.pageLoadMessagesSignal.set(page.number);
          this.OldMessagesSignal.set([]);
          this.loadAllMessagesSignal.set(false);
          this.loadingOldMessagesSignal.set(false);
          this.markChatAsRead(chatId).subscribe({
            next: (data) => {
              this.resetUnreadCount(chatId);
            },
            error: (err) => {
              console.error('Error marking chat as read:', err);
            },
          });
        },
        error: (err) => {
          console.error(err);
          this.loadingChatMessagesSignal.set(false);
        },
      });
    }
  }

  sendMessage(sendMessage: SendChatMessage) {
    const chatId = this.selectedChatIdSignal();
    if (!chatId) {
      console.error('No chat selected');
      return;
    }

    this.webSocketService.sendMessage(sendMessage);
    this.isMessageSentSignal.set(true);
    setTimeout(() => {
      this.isMessageSentSignal.set(false);
    }, 500);
  }

  searchIfChatExists(username: string): Boolean {
    if (this.existsChatByUsername(username)) {
      this.selectChat(this.getChatIdByUsername(username)!);
      return true;
    }
    return false;
  }

  existsChatByUsername(username: string): Boolean {
    return this.chatsSignal().some((chat) => chat.otherUsername === username);
  }

  getChatIdByUsername(username: string): number | null {
    const chat = this.chatsSignal().find(
      (chat) => chat.otherUsername === username
    );
    return chat ? chat.id : null;
  }

  destroy() {
    if (this.selectedChatIdSignal()) {
      this.webSocketService.unsubscribeFromChat(this.selectedChatIdSignal()!);
    }
    this.webSocketService.disconnect();
  }

  resetState() {
    this.chatsSignal.set([]);
    this.selectedChatIdSignal.set(null);
    this.currentUserIdSignal.set(null);
    this.historicalMessagesSignal.set([]);
    this.OldMessagesSignal.set([]);
    this.loadingChatMessagesSignal.set(false);
    this.totalPagesMessagesSignal.set(0);
    this.pageLoadMessagesSignal.set(0);
    this.loadingOldMessagesSignal.set(false);
    this.loadAllMessagesSignal.set(false);
  }

  disconnetWebSocket() {
    this.destroy();
    this.resetState();
  }

  refreshTokenInWebSocket() {
    if (this.webSocketService.isConnected()) {
      this.webSocketService.disconnect();
      this.webSocketService.connect();
      if (this.selectedChatIdSignal()) {
        this.webSocketService.subscribeToChat(this.selectedChatIdSignal()!);
      }
    }
  }

  setLoadOldChatMessagesToFalse() {
    this.loadOldChatMessagesSignal.set(false);
  }

  resetUnreadCount(chatId: number) {
    this.chatsSignal.update((chats) => {
      return chats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      });
    });
  }

  private calculateUnreadCount(
    message: RecieveChatMessage,
    currentCount: number
  ): number {
    if (this.selectedChatIdSignal() === message.chatId) {
      this.markChatAsRead(message.chatId).subscribe({
        next: () => this.resetUnreadCount(message.chatId),
      });
      return 0;
    } else {
      const isNewUnreadMessage =
        !message.isRead && message.senderId !== this.currentUserIdSignal();
      return isNewUnreadMessage ? (currentCount || 0) + 1 : currentCount || 0;
    }
  }
}
