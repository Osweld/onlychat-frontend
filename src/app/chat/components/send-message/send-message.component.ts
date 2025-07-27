import { Component, computed, inject } from '@angular/core';
import { SendChatMessage } from '../../interfaces/chat.interface';
import { ChatService } from '../../services/chat.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChatUtilitiesService } from '../../services/chat-utilities.service';

@Component({
  selector: 'app-send-message',
  imports: [ReactiveFormsModule,MessageModule,InputTextModule,ButtonModule],
  templateUrl: './send-message.component.html',
  styles: ``,
  host: {
    class: 'p-3',
  },
})
export class SendMessageComponent {

  recipentUsername = computed(() => this.chatSelected()?.otherUsername || '');


  private chatService = inject(ChatService);
  private chatUtilitiesService = inject(ChatUtilitiesService)

  chatSelected = computed(() => this.chatService.selectedChat());



  sendMessage() {
    if (this.sendMessageForm.invalid) {
      this.sendMessageForm.markAllAsTouched();
      return;
    }

     this.chatUtilitiesService.scrollToBottom();

    const sendMessage: SendChatMessage = {
      chatId: this.chatSelected()?.id || 0,
      message: this.sendMessageForm.get('message')?.value || '',
      recipientUsername: this.recipentUsername(),
    };

    this.chatService.sendMessage(sendMessage);
    this.sendMessageForm.reset();
   
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
  };

}
