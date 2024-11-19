import {
  Client,
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import StoreManager from "../util/manange-store";
import { DebateData } from "../types/debate";
import {Palette} from "../util/color-palette";
import consola from "consola";

module.exports = {
  name: "DebateLogger",
  register: (client: Client) => {
    client.on("messageCreate", async (message: Message) => {
      if (!message.channel.isTextBased()) return;
      if (message.author.bot) return;
      if (message.content === "") return;

      const store = new StoreManager("debate");

      const debateId = message.channelId;
      const debate = store.get(debateId) as DebateData;
      if (!debate) return;

      debate.messages.push({
        username: message.author.displayName,
        userColor: message.author.hexAccentColor || Palette.WHITE,
        userAvatar: message.author.avatarURL() || "",
        message: message.content, // cleanContent 대신 content 사용
        messageTimestamp: message.createdTimestamp.toString(),
      });

      store.set(debateId, debate);
    });
    consola.info(`debateLogger registered`);
  },
};
