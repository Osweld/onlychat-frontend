import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { ChatService } from '../../services/chat.service';
import { Chat } from '../../interfaces/chat.interface';
import { MobileLayoutService } from '../../services/mobile-layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [CardModule,CommonModule, ButtonModule,AvatarModule,BadgeModule,ProgressSpinnerModule, SkeletonModule],
  templateUrl: './chat-list.component.html',
  styles: ``,
  host: {
    class: 'flex flex-col w-full h-full md:w-1/4 md:inline-block ',
    '[class.hidden]': '!isActiveOnMobile()',
  }
})
export class ChatListComponent implements OnInit {

  private mobileLayoutService = inject(MobileLayoutService);
  private chatService = inject(ChatService);

  isActiveOnMobile = computed(() => this.mobileLayoutService.isListActiveOnMobile());
  isLoading = signal(true);
 

  chats = computed(() => this.chatService.chats())
  selectedChatId = computed(() => this.chatService.selectedChatId())

  ngOnInit(): void {
    this.loadChats();
  }

  loadChats(){
    this.isLoading.set(true)
    this.chatService.loadChats()
    setTimeout(() => {
      this.isLoading.set(false);
      console.log('Chats loaded:', this.chats());
    }, 500);
  }

  selectChat(chat: Chat) {
    this.chatService.selectChat(chat.id)
    this.mobileLayoutService.toggleViewActiveOnMobile()
  }

  refreshChats(): void {
    this.loadChats();
  }


}
