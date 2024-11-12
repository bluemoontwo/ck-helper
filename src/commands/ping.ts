import { SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("핑")
    .setDescription("Pong!이라고 응답합니다."),
  async execute(interaction: any) {
    const sent = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });
    const timeTaken = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.followUp(`응답 속도: ${timeTaken}ms`);
  },
};
