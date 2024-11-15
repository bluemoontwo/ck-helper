import { ChannelType, Guild, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("init-guild")
    .setDescription("서버를 초기화합니다."),
  async execute(interaction: any) {
    const statusMessage = await interaction.reply({
      content: "서버 초기화를 시작합니다.",
      fetchReply: true,
      ephemeral: true,
    });

    const guild: Guild = interaction.guild;

    if (!guild) {
      await statusMessage.edit({ content: "서버를 찾을 수 없습니다." });
      return;
    }

    const debateChannel = await guild.channels.create({
      name: "debate",
      type: ChannelType.GuildText,
    });
  },
};
