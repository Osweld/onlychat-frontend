import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Chat, ChatList, RecieveChatMessage, SearchUserPage, SendChatMessage } from '../interfaces/chat.interface';
import { WebSocketService } from './web-socket.service';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  URL:string = environment.api.baseUrl + '/v1/chat';

  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);

  private chatsSignal = signal<Chat[]>([]);
  private selectedChatIdSignal = signal<number | null>(null);
  private currentUserIdSignal = signal<number | null>(null);
  private historicalMessagesSignal = signal<RecieveChatMessage[]>([]);

  public chats = computed(() => this.chatsSignal());
  public selectedChatId = computed(() => this.selectedChatIdSignal());
  public selectedChat = computed(( )=> {
    const chatId = this.selectedChatIdSignal();
    return chatId ? this.chatsSignal().find(chat => chat.id === chatId) : null;
  });
  public currentUserId = computed(() => this.currentUserIdSignal());

  public currentChatMessages = computed(() =>{
    const chatId = this.selectedChatIdSignal();
    if(!chatId) return [];

    const realtimeMessage = this.webSocketService.getMessagesForChat(chatId)();
    const historicalMessages = this.historicalMessagesSignal();

    const allMessages = [...historicalMessages, ...realtimeMessage];

    const uniqueMessages = allMessages.reduce((acc: RecieveChatMessage[], current) => {
      const exists = acc.find(msg => msg.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
});


  constructor() {
    this.webSocketService.connect();
  }

  loadChats(){
    this.getChats().subscribe({
      next: (chats) => {
        this.chatsSignal.set(chats.chats);
        this.currentUserIdSignal.set(chats.id);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  searchUser(username: string){
    return this.http.get<SearchUserPage>(this.URL + '/search-users', {params: {username}});
  }

  createChat(username: string){
    return this.http.post<Chat>(this.URL , {username}).pipe(
      tap((chat) => {
        this.chatsSignal.update(chats => [...chats, chat]);
        this.selectChat(chat.id);
      }),
      catchError((error) => {
        console.error('Error creating chat:', error);
        return throwError(() => error);
      }),
    )
  }

  getChats(){
    return this.http.get<ChatList>(this.URL + '/user-chats');
  }

  getChatMessages(){
    return this.http.get<RecieveChatMessage[]>(this.URL + `/messages/${this.selectedChatIdSignal()}`) 
  }

  selectChat(chatId: number){
    if(this.selectedChatIdSignal() !== chatId) {
      if(this.selectedChatIdSignal()){
        this.webSocketService.unsubscribeFromChat(this.selectedChatIdSignal()!);
        this.historicalMessagesSignal.set([]);
      }

      
      this.selectedChatIdSignal.set(chatId);
      this.webSocketService.subscribeToChat(chatId);
      this.getChatMessages().subscribe({
        next: (messages) => {
          this.historicalMessagesSignal.update(history => [...history, ...messages]);
        },
        error: (err) => {
          console.error(err);
        }
      })

    }
  }

  sendMessage(sendMessage: SendChatMessage){
    const chatId = this.selectedChatIdSignal();
    if(!chatId){
      console.error('No chat selected');
      return;
    }

    this.webSocketService.sendMessage(sendMessage);
  }

  searchIfChatExists(username: string):Boolean{
    if(this.existsChatByUsername(username)){
      this.selectChat(this.getChatIdByUsername(username)!);
      return true;
    }
    return false;
  }


  existsChatByUsername(username: string):Boolean{
    return this.chatsSignal().some(chat => chat.otherUsername === username);
  }

  getChatIdByUsername(username: string): number | null {
    const chat = this.chatsSignal().find(chat => chat.otherUsername === username);
    return chat ? chat.id : null;
  }






  destroy() {
    if (this.selectedChatIdSignal()) {
      this.webSocketService.unsubscribeFromChat(this.selectedChatIdSignal()!);
    }
    this.webSocketService.disconnect();
  }


}
