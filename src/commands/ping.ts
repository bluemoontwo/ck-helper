import { SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("현재 서버의 응답 속도를 확인합니다."),
  async execute(interaction: any) {
    const sent = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });
    const timeTaken = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.followUp(`응답 속도: ${timeTaken}ms`);
  },
};
