import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  CacheType,
  TextChannel,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionsBitField,
} from "discord.js";
import StoreManager from "../../util/manange-store";
import { VoteData } from "../../types/vote";

module.exports = {
  // 슬래시 커맨드 정의
  data: new SlashCommandBuilder()
    .setName("start-vote") // 커맨드 이름 설정
    .setDescription("새로운 투표를 생성합니다.") // 커맨드 설명
    // 투표 제목 옵션
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("투표의 제목을 입력합니다.")
        .setRequired(true)
    )
    // 투표 설명 옵션
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("투표의 설명을 입력합니다.")
        .setRequired(true)
    )
    // 투표를 보낼 채널 옵션
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("투표를 보낼 채널을 선택합니다.")
        .setRequired(true)
    )
    // 투표 항목 개수 옵션 (2-10개)
    .addIntegerOption((option) =>
      option
        .setName("options_count")
        .setDescription("투표 항목의 개수를 입력합니다 (최대 10개)")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(10)
    )
    // 투표 항목 1-10 옵션들
    .addStringOption((option) =>
      option
        .setName("option1")
        .setDescription("첫 번째 투표 항목")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setDescription("두 번째 투표 항목")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option3")
        .setDescription("세 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option4")
        .setDescription("네 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option5")
        .setDescription("다섯 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option6")
        .setDescription("여섯 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option7")
        .setDescription("일곱 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option8")
        .setDescription("여덟 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option9")
        .setDescription("아홉 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option10")
        .setDescription("열 번째 투표 항목")
        .setRequired(false)
    ),

  // 커맨드 실행 함수
  async execute(
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | MessageContextMenuCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
  ) {
    if (
      !interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      interaction.reply({
        content: "권한이 없습니다.",
        ephemeral: true,
      });
      return;
    }
    // 투표 데이터 저장소 초기화
    const store = new StoreManager("votes");
    const channel = interaction.channel as TextChannel;

    // 채널 유효성 검사
    if (!channel) {
      interaction.reply({
        content: "채널을 선택해주세요.",
        ephemeral: true,
      });
      return;
    }
    if (!("options" in interaction)) return;

    // 투표 제목과 설명 가져오기
    const title = (
      interaction as ChatInputCommandInteraction
    ).options.getString("title");
    const description = (
      interaction as ChatInputCommandInteraction
    ).options.getString("description");

    // 고유한 투표 ID 생성
    const voteId = `${Date.now()}`;

    // 임베드 메시지 생성
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("#eb7723")
      .setFooter({
        text: `vote id: ${voteId}`,
      })
      .setTimestamp();

    // 투표 항목 개수 가져오기
    const optionsCount = (
      interaction as ChatInputCommandInteraction
    ).options.getInteger("options_count");
    if (!optionsCount) return;

    // 버튼 컴포넌트 생성
    const row = new ActionRowBuilder<ButtonBuilder>();

    // 투표 데이터 구조 초기화
    let voteData: VoteData = {
      title: title || "",
      votedUser: [],
      options: {},
      closed: false,
    };

    // 투표 항목별 버튼 생성 및 데이터 구조화
    for (let i = 1; i <= optionsCount; i++) {
      const buttonLabel = (
        interaction as ChatInputCommandInteraction
      ).options.getString(`option${i}`);
      if (!buttonLabel) return;
      const button = new ButtonBuilder()
        .setCustomId(`vote_${voteId}_${buttonLabel}`)
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary);
      row.addComponents(button);
      voteData.options[buttonLabel] = { count: 0 };
    }

    // 투표 데이터 저장
    store.set(voteId, voteData);

    // 지정된 채널에 투표 메시지 전송
    const voteChannel = (
      interaction as ChatInputCommandInteraction
    ).options.getChannel("channel");
    if (!voteChannel) return;
    if (!(voteChannel instanceof TextChannel)) return;
    await voteChannel.send({
      embeds: [embed],
      components: [row],
    });

    // 투표 생성 완료 메시지 전송
    interaction.reply({
      content: "투표가 생성되었습니다.",
      ephemeral: true,
    });
  },
};
