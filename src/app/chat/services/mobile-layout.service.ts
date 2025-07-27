import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileLayoutService {

  private isListActiveOnMobileSignal = signal<boolean>(true);
  private isMessageActiveOnMobileSignal = signal<boolean>(false);

  public isListActiveOnMobile = computed(() => this.isListActiveOnMobileSignal());
  public isMessageActiveOnMobile = computed(() => this.isMessageActiveOnMobileSignal());

  toggleViewActiveOnMobile() {
    this.isListActiveOnMobileSignal.update((prev) => !prev);
    this.isMessageActiveOnMobileSignal.update((prev) => !prev);
  }


  constructor() { }

  setMessageViewActiveOnMobile() {
    this.isMessageActiveOnMobileSignal.set(true);
    this.isListActiveOnMobileSignal.set(false);
  }
}
