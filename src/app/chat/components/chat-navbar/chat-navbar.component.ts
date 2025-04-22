
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/chat.interface';
import { Router } from '@angular/router';
import { MobileLayoutService } from '../../services/mobile-layout.service';

@Component({
  selector: 'app-chat-navbar',
  imports: [
    ButtonModule,
    CardModule,
    IconFieldModule,
    IconFieldModule,
    InputIconModule,
    AutoCompleteModule,
    FormsModule,
  ],
  templateUrl: './chat-navbar.component.html',
  styles: ``,
})
export class ChatNavbarComponent {

  private mobileLayoutService = inject(MobileLayoutService);
  
  filteredUsers: User[] = [];
  username: string = '';
  mobileMenuVisible = signal(false);
  
  theme: string = localStorage.getItem('theme') || 'light';

  private chatService = inject(ChatService);
  private router = inject(Router)

  filterUsers(event: AutoCompleteCompleteEvent) {
    const query = event.query;

    if (query.length < 3) {
      this.filteredUsers = [];
      return;
    }

    this.chatService.searchUser(query).subscribe({
      next: (response) => {
        this.filteredUsers = response.content;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.filteredUsers = [];
      },
    });
  }

  onSelectUser(event: AutoCompleteSelectEvent) {
    const user: User = event.value;

    if(this.chatService.searchIfChatExists(user.username)){
      return;
    }
    this.chatService.createChat(user.username).subscribe({
      next: () => {
        this.username = '';
        this.filteredUsers = [];
        this.mobileMenuVisible.set(false);
      },
      error: (error) => {
        console.error('Error creating chat:', error);
      },
    });

    this.username = "";
    this.mobileLayoutService.setListActiveOnMobile(false);  
    this.toggleMobileMenu();
  }

  toggleMobileMenu() {
    this.mobileMenuVisible.set(!this.mobileMenuVisible());
  }

  toggleTheme() {
    const element = document.querySelector('html');
    const currentTheme = this.theme;
    this.theme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    if (this.theme === 'dark') {
      element?.classList.add('dark');
    } else {
      element?.classList.remove('dark');
    }
  }


  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }
}
