import { Injectable } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Injectable({
  providedIn: 'root',
})
export class ChatUtilitiesService {
  constructor() {}

  private viewport: CdkVirtualScrollViewport | null = null;

  setViewport(viewport: CdkVirtualScrollViewport) {
    this.viewport = viewport;
  }

  scrollToBottom() {
    const viewport = this.viewport;
    if (!viewport) return;

    setTimeout(() => {
      viewport.scrollTo({ bottom: 0 });
    }, 100);
  }
}
