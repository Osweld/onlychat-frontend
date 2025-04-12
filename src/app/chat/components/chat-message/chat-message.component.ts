import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-chat-message',
  imports: [ButtonModule,AvatarModule,InputTextModule],
  templateUrl: './chat-message.component.html',
  styles: ``,
  host: {
    class: ' w-full md:inline-block flex flex-col w-full h-full overflow-y-auto md:w-3/4 border-l border-surface'
  }
 
})
export class ChatMessageComponent {

}
