import { Client, EmbedBuilder } from "discord.js";
import { Reminder } from "../types/reminder";

import { ReminderTime } from "../types/reminder";
import StoreManager from "./manange-store";

export function registReminder(client: Client) {
  const store = new StoreManager("reminder");
  setInterval(() => {
    const currentTime = Date.now().toString().slice(0, -4);
    const reminders = store.get(currentTime) as Reminder[];
    if (!reminders) return;

    reminders.map((reminder) => {
      const channel = client.channels.cache.get(reminder.channelId);
      if (!channel || !channel.isTextBased()) return;

      if ("send" in channel) {
        const embed = new EmbedBuilder()
          .setColor("#eb7723")
          .setTitle(reminder.title)
          .setDescription(reminder.description.replace(/\\n/g, "\n"));

        const date = new Date();

        if (reminder.mention?.everyone) {
          channel.send({
            content: "@everyone",
          });
        }

        if (reminder.mention?.author) {
          channel.send({
            content: `<@${reminder.authorId}>`,
          });
        }

        channel.send({
          embeds: [embed],
        });
      }
    });

    store.delete(currentTime);
  }, 1000);
}
