import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login-page',
  imports: [CardModule, ButtonModule, InputTextModule, CheckboxModule,DividerModule],
  templateUrl: './login-page.component.html',
  styles: ``,
})
export class LoginPageComponent {}
