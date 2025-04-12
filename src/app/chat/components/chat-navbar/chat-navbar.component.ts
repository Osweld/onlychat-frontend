import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-chat-navbar',
  imports: [MenubarModule, ButtonModule,CardModule,IconFieldModule,IconFieldModule,InputIconModule, InputText],
  templateUrl: './chat-navbar.component.html',
  styles: ``,
})
export class ChatNavbarComponent {

  mobileMenuVisible:boolean = false;
  theme:string = localStorage.getItem('theme') || 'light-mode';

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }


  toggleTheme() {
    const element = document.querySelector('html');
    const currentTheme = this.theme;
    this.theme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    if (this.theme === 'dark') {
      element?.classList.add('dark');
    }else {
      element?.classList.remove('dark');
    }
}
  
}
