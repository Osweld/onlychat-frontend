
import { Component } from '@angular/core';
import { ChatListComponent } from '../../components/chat-list/chat-list.component';
import { ChatNavbarComponent } from '../../components/chat-navbar/chat-navbar.component';
import { ChatMessageComponent } from '../../components/chat-message/chat-message.component';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-chat-page',
  imports: [ChatListComponent,ChatNavbarComponent,ChatMessageComponent,CardModule],
  templateUrl: './chat-page.component.html',
  styles: ``,
  host:{
    class:'flex flex-col w-full'
  }
})
export class ChatPageComponent {

  username: string = '';


}
