import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-chat-list',
  imports: [CardModule, ButtonModule,AvatarModule,BadgeModule],
  templateUrl: './chat-list.component.html',
  styles: ``,
  host: {
    class: 'flex flex-col w-full h-full md:w-1/4 hidden md:inline-block'
  }
})
export class ChatListComponent {

}
