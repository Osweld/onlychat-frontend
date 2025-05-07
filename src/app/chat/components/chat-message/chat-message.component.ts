import {
  AfterViewChecked,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChatService } from '../../services/chat.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { SendChatMessage } from '../../interfaces/chat.interface';
import { MobileLayoutService } from './../../services/mobile-layout.service';
import { SendMessageComponent } from "../send-message/send-message.component";

@Component({
  selector: 'app-chat-message',
  imports: [
    ButtonModule,
    AvatarModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    DatePipe,
    SendMessageComponent
],
  templateUrl: './chat-message.component.html',
  host: {
    class:
      ' w-full md:inline-block flex flex-col w-full h-full overflow-y-auto md:w-3/4 border-l border-surface',
    '[class.hidden]': '!isActiveOnMobile()',
  },
})
export class ChatMessageComponent
  implements AfterViewChecked, OnInit, OnDestroy
{
  private mobileLayoutService = inject(MobileLayoutService);
  private chatService = inject(ChatService);


  previousChatId = signal<number>(0);

  private firstLoadCompleted = signal(false);

  messages = computed(() => this.chatService.currentChatMessages());
  chatSelected = computed(() => this.chatService.selectedChat());
  currentUserId = computed(() => this.chatService.currentUserId());
  loadingChatMessages = computed(() => this.chatService.loadingChatMessages());
  loadingOldMessages = computed(() => this.chatService.loadingOldMessages());

  isActiveOnMobile = computed(
    () => !this.mobileLayoutService.isListActiveOnMobile$()
  );


  constructor() {
    effect(() => {
      const msgs = this.messages();
      const chat = this.chatSelected();
      const isLoading = this.loadingChatMessages();
      if (chat && msgs.length > 0 && !isLoading && !this.firstLoadCompleted()) {
        setTimeout(() => this.scrollToBottom(), 10);
        this.firstLoadCompleted.set(true);
      }
    });

   

    effect(() => {
      if (this.isActiveOnMobile()) {
        setTimeout(() => this.scrollToBottom(), 10);
      }
    });
  }

  ngOnInit() {
    
  }

  ngAfterViewChecked() {
    const currentChatId = this.chatSelected()?.id || 0;
    if (currentChatId !== this.previousChatId() && currentChatId !== 0) {
      this.previousChatId.set(currentChatId);
      this.firstLoadCompleted.set(false);
    }
  }

  ngOnDestroy() {
   
  }

  getOldMessages() {
      this.chatService.getChatOldPaginationMessages();
  }

  backToList() {
    this.mobileLayoutService.toggleListActiveOnMobile();
  }

  scrollToBottom() {
  }
}
