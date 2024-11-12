import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
} from "discord.js";
import StoreManager from "../util/manange-store";
import { WelcomeData } from "../types/welcome";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-welcome")
    .setDescription("환영 메시지를 설정합니다.")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("환영 메시지를 입력합니다.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const message = interaction.options.getString("message");
    const store = new StoreManager("welcome");
    let welcomeMessage = store.get(interaction.guildId || "") as WelcomeData;

    if (!welcomeMessage) {
      welcomeMessage = {
        toSystemChannel: message || undefined,
      };
    } else {
      welcomeMessage.toSystemChannel = message || undefined;
    }
    store.set(interaction.guildId || "", welcomeMessage);

    interaction.reply({
      content: "환영 메시지를 설정하였습니다.",
    });
  },
};
