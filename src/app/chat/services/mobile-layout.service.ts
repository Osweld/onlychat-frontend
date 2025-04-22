import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileLayoutService {

  private isListActiveOnMobile = signal(true);

  get isListActiveOnMobile$() {
    return this.isListActiveOnMobile.asReadonly();
  }

  toggleListActiveOnMobile() {
    this.isListActiveOnMobile.update((prev) => !prev);
  }

  setListActiveOnMobile(value: boolean) {
    this.isListActiveOnMobile.set(value);
  }

  constructor() { }
}
