import { MobileLayoutService } from './../../services/mobile-layout.service';
import { Component, computed, inject, signal } from '@angular/core';
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
import { Message } from 'primeng/message';
import { SendChatMessage } from '../../interfaces/chat.interface';

@Component({
  selector: 'app-chat-message',
  imports: [
    ButtonModule,
    AvatarModule,
    InputTextModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './chat-message.component.html',
  styles: ``,
  host: {
    class:
      ' w-full md:inline-block flex flex-col w-full h-full overflow-y-auto md:w-3/4 border-l border-surface',
    '[class.hidden]': '!isActiveOnMobile()',
  },
})
export class ChatMessageComponent {
  private mobileLayoutService = inject(MobileLayoutService);
  private chatService = inject(ChatService);

  messages = computed(() => this.chatService.currentChatMessages());
  chatSelected = computed(() => this.chatService.selectedChat());
  currentUserId = computed(() => this.chatService.currentUserId());

  isActiveOnMobile = computed(
    () => !this.mobileLayoutService.isListActiveOnMobile$()
  );
  isLoading = signal(false);

  backToList() {
    this.mobileLayoutService.toggleListActiveOnMobile();
  }

  sendMessageForm = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(255),
    ]),
  });

  sendMessageFormValidationMesssages = {
    message: [
      { type: 'required', message: 'Message is required' },
      { type: 'minlength', message: 'Message must be at least 1 characters' },
      { type: 'maxlength', message: 'Message must be at most 255 characters' },
    ],
  }


  sendMessage(){
    if(this.sendMessageForm.invalid){
      this.sendMessageForm.markAllAsTouched();
      return;
    }

    console.log(this.messages())
      const sendMessage: SendChatMessage = {
        chatId: this.chatSelected()?.id || 0,
        message: this.sendMessageForm.get('message')?.value || '',
      }


      this.chatService.sendMessage(sendMessage)
      this.sendMessageForm.reset();
  }
}
