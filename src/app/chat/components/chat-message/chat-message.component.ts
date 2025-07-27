import { ChatUtilitiesService } from './../../services/chat-utilities.service';
import {
  AfterViewChecked,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  effect,
  OnDestroy,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { ChatService } from '../../services/chat.service';
import {} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MobileLayoutService } from './../../services/mobile-layout.service';
import { SendMessageComponent } from '../send-message/send-message.component';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
import { NgZone } from '@angular/core';
import { throttleTime, map, pairwise, filter } from 'rxjs/operators';

@Component({
  selector: 'app-chat-message',
  imports: [
    ButtonModule,
    AvatarModule,
    ProgressSpinnerModule,
    DatePipe,
    SendMessageComponent,
    ScrollingModule,
  ],
  templateUrl: './chat-message.component.html',
  host: {
    class:
      ' w-full md:inline-block flex flex-col w-full h-full overflow-y-auto md:w-3/4 border-l border-surface',
    '[class.hidden]': '!isActiveOnMobile()',
  },
  styles: [],
})
export class ChatMessageComponent implements AfterViewChecked, OnDestroy {
  viewport = viewChild(CdkVirtualScrollViewport);

  private mobileLayoutService = inject(MobileLayoutService);
  private chatService = inject(ChatService);
  private ngZone = inject(NgZone);
  private chatUtilitiesService = inject(ChatUtilitiesService);

  private isLoadingMore = signal(false);
  private scrollSubscription: any;

  private previousChatId = signal<number>(0);
  private firstLoadCompleted = signal(false);
  private oldScrollHeight = signal(0);

  itemSize = signal(80);

  messages = computed(() => this.chatService.currentChatMessages());
  chatSelected = computed(() => this.chatService.selectedChat());
  currentUserId = computed(() => this.chatService.currentUserId());
  loadingChatMessages = computed(() => this.chatService.loadingChatMessages());
  loadingOldMessages = computed(() => this.chatService.loadingOldMessages());
  loadOldChatMessages = computed(() => this.chatService.loadOldChatMessages());
  isMessageSent = computed(() => this.chatService.isMessageSent());

  isActiveOnMobile = computed(() =>
    this.mobileLayoutService.isMessageActiveOnMobile()
  );

  constructor() {
    effect(() => {
      const msgs = this.messages();
      const chat = this.chatSelected();
      const isLoading = this.loadingChatMessages();
      if (chat && msgs.length > 0 && !isLoading && !this.firstLoadCompleted()) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 50);

        this.firstLoadCompleted.set(true);
      }
    });

    effect(() => {
      if (this.isMessageSent()) {
        this.scrollToBottom();
      }
    });

    effect(() => {
      if (this.isActiveOnMobile()) {
        setTimeout(() => this.scrollToBottom(), 10);
      }
    });

    effect(() => {
      if (this.loadOldChatMessages()) {
        this.isLoadingMore.set(false);
        this.chatService.setLoadOldChatMessagesToFalse();
        const difference =
          this.viewport()?.measureScrollOffset('bottom')! -
          this.oldScrollHeight();
        this.viewport()?.scrollToOffset(
          this.viewport()?.measureScrollOffset('top')! + difference
        );
      }
    });
  }
  ngAfterViewChecked() {
    if (this.viewport() !== null || this.viewport() !== undefined) {
      this.chatUtilitiesService.setViewport(this.viewport()!);
    }

    const currentChatId = this.chatSelected()?.id || 0;
    if (currentChatId !== this.previousChatId() && currentChatId !== 0) {
      this.previousChatId.set(currentChatId);
      this.firstLoadCompleted.set(false);
      this.isLoadingMore.set(false);

      setTimeout(() => {
        this.setupVirtualScroll();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private setupVirtualScroll() {
    const viewport = this.viewport();
    if (!viewport) return;
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }

    this.scrollSubscription = viewport
      .elementScrolled()
      .pipe(
        throttleTime(50),
        map(() => viewport.measureScrollOffset('top')),
        pairwise(),
        filter(([prev, curr]) => {
          return (
            curr < 150 &&
            curr < prev &&
            !this.loadingOldMessages() &&
            !this.chatService.loadAllMessages()
          );
        })
      )
      .subscribe(() => {
        this.loadOlderMessages();
      });
  }

  private loadOlderMessages() {
    if (this.isLoadingMore()) return;
    this.getOldMessages();
    this.oldScrollHeight.set(
      this.viewport()?.measureScrollOffset('bottom') || 0
    );

    this.isLoadingMore.set(true);
  }

  getOldMessages() {
    if (this.loadingOldMessages() || this.chatService.loadAllMessages()) {
      return;
    }
    this.chatService.getChatOldPaginationMessages();
  }

  backToList() {
    this.mobileLayoutService.toggleViewActiveOnMobile();
  }

  scrollToBottom() {
    const viewport = this.viewport();
    if (!viewport) return;

    this.ngZone.run(() => {
      viewport.scrollTo({ bottom: 0 });
      const items = viewport.getRenderedRange();
      if (items.end > 0) {
        const lastElementIndex = this.messages().length - 1;
        viewport.scrollToIndex(lastElementIndex);
      }
    });
  }


  private checkIfAtBottomAndMarkAsRead(){
    const viewport = this.viewport();
    if (!viewport) return;

    
  }
}
