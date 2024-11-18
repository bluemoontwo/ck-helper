import { EmbedBuilder, Message, SlashCommandBuilder } from "discord.js";
import {AddExecute, CommandData, InteractionHandler} from "../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("highlight")
    .setNameLocalization("ko", "강조")
    .setDescription("메시지를 강조해 표시합니다.")
    .addStringOption((option) =>
      option
        .setName("메시지")
        .setDescription("강조할 메시지를 입력합니다.")
        .setRequired(true)
    )
    .toJSON()
)
@InteractionHandler()
export default class HighlightCommand {
  @AddExecute("highlight")
  public async execute(interaction: any) {
    await interaction.reply({
      content: "메시지를 표시하고 있어요..",
      fetchReply: true,
      ephemeral: true,
    });

    const message = interaction.options.getString("메시지");
    if (!message) {
      interaction.editReply({
        content: "메시지를 입력해주세요.",
        ephemeral: true,
      });
      return;
    }

    const webhook = await interaction.channel.createWebhook({
      name: interaction.user.username,
      avatar: interaction.user.displayAvatarURL(),
    });

    const embed = new EmbedBuilder()
      .setTitle(message)
      .setColor(Math.floor(Math.random() * 0xffffff));

    const sent = (await webhook.send({
      embeds: [embed],
      username: interaction.user.displayName,
      avatarURL: interaction.user.displayAvatarURL(),
    })) as Message;

    await webhook.delete();

    await interaction.editReply({
      content: "메시지를 강조했어요!",
    });
  }
}
