export interface DebateData {
  title: string;
  author: string;
  triggerMessage: string;
  description: string;
  channel: string;
  threadId: string;
  messages: MessageData[];
  closed: boolean;
}

export interface MessageData {
  username: string;
  userColor: string;
  userAvatar: string;
  message: string;
  messageTimestamp: string;
}
