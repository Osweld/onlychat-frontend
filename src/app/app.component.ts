import { Toast } from 'primeng/toast';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  private authService = inject(AuthService);


  ngOnInit(){

    if(!this.authService.isTokenExpired()) {
      this.authService.setupTokenRefresh();
    }

     const theme = localStorage.getItem('theme') || 'light';

    const element = document.querySelector('html');
    if (element) {
      if (theme === 'dark') {
        element.classList.add('dark');
      }
      else {
        element.classList.remove('dark');
      }
    }

  }

@HostListener('window:focus')
onFocus(): void {
  const expirationDate = this.authService.getExpirationDate();
  if (expirationDate) {
    const currentTime = new Date().getTime();
    const expirationTime = expirationDate.getTime();

    if (currentTime > expirationTime || (expirationTime - currentTime) < 300000) {
      this.authService.getTokenRefresh().subscribe({
        next: (response) => {
        this.authService.refreshToken(response);
        },
        error: (error) => {
          this.authService.logout();
        },
      });
    }
  }
  
}



}
