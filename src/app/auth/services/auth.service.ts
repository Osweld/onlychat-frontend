import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  ChangePassword,
  LoginCredentials,
  LoginResponse,
  RefreshToken,
  SignupCredentials,
  SignupResponse,
} from '../interfaces/auth.interface';
import { interval, Subscription } from 'rxjs';
import { ChatService } from '../../chat/services/chat.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private userSignal = signal(null);

  public user = computed(() => this.userSignal());

  http = inject(HttpClient);
  private chatService = inject(ChatService);
  private tokenRefreshSubscription?: Subscription;
  private router = inject(Router);

  URL: String = environment.api.baseUrl + '/v1/auth';

  constructor() {
  }

  login(loginCredentials: LoginCredentials) {
    const { username, password } = loginCredentials;
    return this.http.post<LoginResponse>(this.URL + '/login', {
      username,
      password,
    });
  }

  forgotPassword(email: string) {
    return this.http.get(this.URL + '/reset-password', { params: { email } });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(
      this.URL + '/reset-password',
      { password },
      { params: { token } }
    );
  }

  register(signupCredentials: SignupCredentials) {
    return this.http.post<SignupResponse>(
      this.URL + '/signup',
      signupCredentials
    );
  }

  activateAccount(token: string) {
    return this.http.get(this.URL + '/activate-account/' + token);
  }

  resendActivationEmail(email: string) {
    return this.http.post(this.URL + '/resend-activate-account-token', {
      email,
    });
  }

  changePassword(changePassword: ChangePassword){
    return this.http.post(this.URL + '/change-password', changePassword);
  }

  getTokenRefresh() {
    return this.http.post<RefreshToken>(this.URL + '/refresh-token', {
      withCredentials: true,
    });
  }

  getExpirationDate() {
    const expiration = localStorage.getItem('expiration');
    if (expiration) {
      return new Date(expiration);
    }
    return null;
  }

  isTokenExpired() {
    const expirationDate = this.getExpirationDate();
    if (expirationDate) {
      return expirationDate < new Date();
    }
    return true;
  }

  setupTokenRefresh() {
    this.clearTokenRefresh();
    this.tokenRefreshSubscription = interval(60000 * 10).subscribe({
      next: () => {
        if (!this.isTokenExpired()) {
          this.getTokenRefresh().subscribe({
            next: (response) => {
              this.refreshToken(response);
              console.log('Token refreshed successfully');
            },
            error: (error) => {
             this.logout();
              console.error('Error refreshing token', error);
            },
          });
        }
      },
    });
  }

  refreshToken(refreshToken: RefreshToken) {
    const { token, expirationDate } = refreshToken;
    localStorage.setItem('access_token', token);
    localStorage.setItem('expiration', expirationDate.toString());
    this.chatService.refreshTokenInWebSocket();
  }

  logout(){
   
    this.clearTokenRefresh();
    this.chatService.disconnetWebSocket();

    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');

    this.router.navigate(['/login']);
  }

  clearTokenRefresh() {
    if (this.tokenRefreshSubscription) {
      this.tokenRefreshSubscription.unsubscribe();
      this.tokenRefreshSubscription = undefined;
    }
  }
}
