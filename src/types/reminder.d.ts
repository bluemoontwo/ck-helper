export type ReminderTime = {
  [key: stirng]: Reminder[];
};

export type Reminder = {
  name: string;
  description: string;
  authorId: string;
  guildId: string;
  channelId: string;
  mention?: {
    everyone: boolean;
    author: boolean;
  };
  time: string;
};
