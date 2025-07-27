export interface SearchUserPage {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: User[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}

export interface User {
  id: number;
  username: string;
}

export interface Pageable {
  offset: number;
  sort: Sort;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface ChatList {
  id: number;
  username: string;
  chats: Chat[];
}

export interface Chat {
  chatType: string;
  joinedAt: Date;
  otherUsername: string;
  name: string;
  id: number;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
}

export interface RecieveChatMessage {
  id: number;
  chatId: number;
  message: string;
  timestamp: string;
  senderId: number;
  senderUsername: string;
  isRead: boolean;
}

export interface SendChatMessage{
    chatId: number;
    message: string;
    recipientUsername: string;
}


export interface ChatMessagePagination {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: RecieveChatMessage[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}

export interface ChatMessageSeen{
  chatId: number;
  userId: number;
}