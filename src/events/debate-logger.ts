import {
  Client,
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import StoreManager from "../util/manange-store";
import { DebateData } from "../types/debate";

module.exports = {
  name: "DebateLogger",
  register: (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
      if (!message.channel.isThread()) return;
      if (message.author.bot) return;
      if (message.content === "") return;

      const store = new StoreManager("debate");
      const debateId = message.channel.name.replace("회의 - ", "");
      const debate = store.get(debateId) as DebateData;
      if (!debate) return;

      debate.messages.push({
        username: message.author.displayName,
        userColor: message.author.hexAccentColor || "#FFFFFF",
        userAvatar: message.author.avatarURL() || "",
        message: message.content, // cleanContent 대신 content 사용
        messageTimestamp: message.createdTimestamp.toString(),
      });

      store.set(debateId, debate);
    });
    console.log(`debateLogger registered`);
  },
};
