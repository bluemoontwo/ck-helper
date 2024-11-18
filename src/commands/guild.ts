import {
  CacheType,
  CacheTypeReducer,
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  SlashCommandBuilder
} from "discord.js";
import {AddExecute, CommandData, InteractionCallbackManager, InteractionHandler} from "../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("guild")
    .setDescription("길드와 관련된 조작을 할 수 있습니다.")
    .addSubcommand((option) =>
      option
        .setName("init")
        .setDescription("길드를 초기화합니다.")
    )
    .toJSON()
)
@InteractionHandler()
export default class GuildCommand {

  // 길드 초기화 명령어
  @AddExecute("guild/init")
  public async initGuild(interaction: ChatInputCommandInteraction) {
    const statusMessage = await interaction.reply({
      content: "서버 초기화를 시작합니다.",
      fetchReply: true,
      ephemeral: true,
    });

    const guild: Guild | null = interaction.guild;

    if (!guild) {
      await statusMessage.edit({content: "서버를 찾을 수 없습니다."});
      return;
    }

    const debateChannel = await guild.channels.create({
      name: "debate",
      type: ChannelType.GuildText,
    });
  }
}
