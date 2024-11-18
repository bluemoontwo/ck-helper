export interface DebateData {
  topic: string;
  author: string;
  description: string;
  interactionChannelId: string;
  triggerMessageId: string;
  categoryId: string;
  channelId: string;
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
