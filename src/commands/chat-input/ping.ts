import {SlashCommandBuilder} from "discord.js";
import {AddExecute, CommandData, InteractionHandler} from "../../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("ping")
    .setNameLocalization("ko", "핑")
    .setDescription("현재 서버의 응답 속도를 확인합니다.")
    .toJSON()
)
@InteractionHandler()
export default class PingChatInputCommand {
  @AddExecute("ping")
  async execute(interaction: any) {
    const sent = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });
    const timeTaken = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.followUp(`응답 속도: ${timeTaken}ms`);
  }
}
