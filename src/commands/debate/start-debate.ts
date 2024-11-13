import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  EmbedBuilder,
  TextChannel,
  ThreadAutoArchiveDuration,
} from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import StoreManager from "../../util/manange-store";
import { DebateData } from "../../types/debate";

module.exports = {
  // 슬래시 커맨드 정의
  data: new SlashCommandBuilder()
    .setName("start-debate")
    .setDescription("회의를 시작합니다.")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("회의의 제목을 입력합니다.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("회의의 설명을 입력합니다.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("회의를 진행할 채널을 선택합니다.")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    interaction.reply({
      content: "회의를 시작하고 있습니다..",
      ephemeral: true,
    });
    // 사용자 입력값 가져오기
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const channel = interaction.options.getChannel("channel");

    // 채널 타입 검증
    if (!(channel instanceof TextChannel)) {
      return interaction.reply({
        content: "텍스트 채널을 선택해주세요.",
        ephemeral: true,
      });
    }

    // 고유한 회의 ID 생성
    const debateId = `${Date.now()}-${interaction.guildId}`;

    const store = new StoreManager("debate");

    // 회의 시작 메시지 전송 및 스레드 생성
    const triggerMessage = await channel.send("새로운 회의를 시작합니다.");

    const thread = await triggerMessage.startThread({
      name: `회의 - ${debateId}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      reason: `${interaction.user.username}님이 회의를 시작하였습니다.`,
    });

    // 회의 데이터 구조 생성
    const debateData = (store.get(debateId) as DebateData) || {
      title: title || "",
      triggerMessage: triggerMessage.id,
      author: interaction.user.id || "",
      description: description || "",
      channel: channel?.id || "",
      messages: [],
      threadId: thread.id,
      closed: false,
    };

    // 회의 데이터 저장
    store.set(debateId, debateData);

    // 회의 시작 임베드 생성
    const startEmbed = new EmbedBuilder()
      .setTitle(title || "")
      .setDescription(description || "")
      .setFooter({
        text: "모든 회의 내용은 기록되며, 이후 html 형식으로 제공됩니다.",
      })
      .setColor("#1E1F22");

    // 회의 제어 버튼 생성
    const row = new ActionRowBuilder<ButtonBuilder>()
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

    // 스레드에 초기 메시지 전송
    thread.send({ embeds: [startEmbed], components: [row] });
  },
};
