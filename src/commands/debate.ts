import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import StoreManager from "../util/manange-store";
import {DebateData} from "../types/debate";
import {
  AddExecute, CommandData,
  InteractionHandler
} from "../util/interaction-handler";
import GuildCommand from "./guild";

@CommandData(
  new SlashCommandBuilder()
    .setName("debate")
    .setDescription("회의와 관련된 조작을 할 수 있습니다.")
    // 회의 시작 커맨드
    .addSubcommand((option) =>
      option
        .setName("start")
        .setDescription("회의를 시작합니다.")
        .addStringOption((option) =>
          option
            .setName("topic")
            .setDescription("회의 주제를 입력합니다.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setDescription("회의 주제에 대한 설명을 입력합니다.")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("회의실을 생성할 카테고리를 입력합니다.")
            .setRequired(true)
        )
    )
    // 회의 종료 커맨드
    .addSubcommand((option) =>
      option
        .setName("close")
        .setDescription("회의를 닫습니다.")
    )
    .toJSON()
)
@InteractionHandler()
export default class DebateCommand {

  // 회의 시작 커맨드
  @AddExecute("debate/start")
  public async startDebate(interaction: ChatInputCommandInteraction<CacheType>) {
    interaction.reply({
      content: "회의실을 생성하고 있습니다..",
      ephemeral: true,
    });

    // 사용자 입력값 가져오기
    const topic = interaction.options.getString("topic");
    const description = interaction.options.getString("description");
    const category = interaction.options.getChannel("category");

    // 카테고리 타입 검증
    if (category?.type !== ChannelType.GuildCategory) {
      return interaction.reply({
        content: "카테고리를 선택해주세요.",
        ephemeral: true,
      });
    }

    // 고유한 회의 ID 생성
    const debateId = `${Date.now()}-${interaction.guildId}`;

    const store = new StoreManager("debate");

    if (interaction.channel?.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "예기치 못한 오류가 발생했습니다.",
        ephemeral: true,
      })
    }

    // 회의용 음성 채널 생성
    const debateChan = await interaction.guild?.channels.create({
      name: `회의 - ${debateId}`,
      type: ChannelType.GuildVoice,
      parent: category?.id,
      reason: `${interaction.user.username}님이 회의를 시작하였습니다.`,
    });

    // 회의 시작 임베드 생성
    const startEmbed = new EmbedBuilder()
      .setTitle("새로운 회의가 시작되었습니다.")
      .setFooter({
        text: `Debate ID: ${debateId}`,
      })
      .setColor("#1E1F22");

    // 회의실 바로가기 버튼 생성
    const triggerMsgRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder({
          label: "회의실 바로가기",
          style: ButtonStyle.Link,
          url: debateChan?.url
        })
      );

    const triggerMessage = await interaction.channel?.send({
      embeds: [startEmbed], components: [triggerMsgRow]
    });

    // 회의 데이터 구조 생성
    const debateData = (store.get(debateId) as DebateData) || {
      topic: topic || "",
      author: interaction.user.id,
      description: description || "",
      interactionChannelId: interaction.channelId,
      triggerMessageId: triggerMessage.id,
      categoryId: category?.id,
      channelId: debateChan?.id,
      messages: [],
      closed: false,
    };

    // 회의 데이터 저장
    store.set(debateId, debateData);

    // 회의 안내 임베드 생성
    const infoEmbed = new EmbedBuilder()
      .setTitle(topic || "")
      .setDescription(description || "")
      .setFooter({
        text: "모든 회의 내용은 기록되며, 이후 html 형식으로 제공됩니다.",
      })
      .setColor("#1E1F22");

    // 회의 제어 버튼 생성
    const infoMsgRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder({
          customId: `debate-close_${debateId}`,
          label: "회의 종료",
          style: ButtonStyle.Danger,
        })
      )
      .addComponents(
        new ButtonBuilder({
          customId: `debate-html_${debateId}`,
          label: "회의록 다운로드",
          style: ButtonStyle.Secondary,
        })
      );

    // 채널에 초기 메시지 전송
    debateChan?.send({embeds: [infoEmbed], components: [infoMsgRow]});
  }

  @AddExecute("debate/close")
  public async closeDebate(interaction: ChatInputCommandInteraction<CacheType>) {
    interaction.reply({

    });
  }
}
