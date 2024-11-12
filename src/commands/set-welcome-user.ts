import { CacheType } from "discord.js";

import { SlashCommandBuilder } from "discord.js";

import { ChatInputCommandInteraction } from "discord.js";
import { WelcomeData } from "../types/welcome";
import StoreManager from "../util/manange-store";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-welcome-user")
    .setDescription("유저에게 환영 메시지를 보냅니다.")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("환영 메시지의 제목을 입력합니다.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("환영 메시지의 설명을 입력합니다.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const store = new StoreManager("welcome");
    const welcomeMessage = store.get(interaction.guildId || "") as WelcomeData;
    if (!welcomeMessage) {
      interaction.reply({
        content: "환영 메시지가 설정되어 있지 않습니다.",
        ephemeral: true,
      });
      return;
    }
    welcomeMessage.toUser = {
      title: title || undefined,
      description: description || undefined,
    };
    store.set(interaction.guildId || "", welcomeMessage);
    interaction.reply({
      content: "유저에게 보낼 환영 메시지를 설정하였습니다.",
    });
  },
};
