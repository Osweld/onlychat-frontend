import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { LoginCredentials, LoginResponse, SignupCredentials, SignupResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);

  URL:String = environment.api.baseUrl + '/v1/auth';

  constructor() { }

  login(loginCredentials: LoginCredentials) {
    const { username, password } = loginCredentials;
    return this.http.post<LoginResponse>(this.URL + '/login', {username, password});
  }

  forgotPassword(email: string) {
    return this.http.get(this.URL + '/reset-password', {params: {email}});
  }

  resetPassword(token: string, password: string) {
    return this.http.post(this.URL + '/reset-password', {token, password});
  }

  register(signupCredentials: SignupCredentials) {
    return this.http.post<SignupResponse>(this.URL + '/signup', signupCredentials);
  }
}
