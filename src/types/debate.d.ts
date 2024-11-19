export interface DebateData {
  roomName: string;
  author: string;
  topic: string;
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
