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
  PermissionsBitField, ChannelType,
} from "discord.js";
import StoreManager from "../util/manange-store";
import { VoteData } from "../types/vote";
import {AddExecute, CommandData, InteractionHandler} from "../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("vote") // 커맨드 이름 설정
    .setDescription("투표 관련 조작을 할 수 있습니다.") // 커맨드 설명
    // 투표 시작 커맨드
    .addSubcommand((option) =>
      option
        .setName("start")
        .setDescription("새로운 투표를 시작합니다.")
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
        )
    )
    // 투표 종료 커맨드
    .addSubcommand((option) =>
      option
        .setName("close")
        .setDescription("투표를 종료합니다.")
        .addStringOption(
          (option) =>
            option
              .setName("vote_id") // 투표 ID 옵션
              .setDescription("종료할 투표의 아이디를 입력합니다.")
              .setRequired(true) // 필수 옵션
        )
        .addBooleanOption(
          (option) =>
            option
              .setName("mention_everyone") // @everyone 멘션 옵션
              .setDescription("모든 사람에게 투표 결과 공개 알림을 보냅니다.")
              .setRequired(false) // 선택 옵션
        )
        .addChannelOption(
          (option) =>
            option
              .setName("channel") // 결과 공개 채널 옵션
              .setDescription("투표 결과 공개 알림을 보낼 채널을 선택합니다.")
              .setRequired(false) // 선택 옵션
        )
    )
    .toJSON()
)
@InteractionHandler()
export default class VoteCommand {

  // 투표 시작 커맨드
  @AddExecute("vote/start")
  async startVote(interaction: ChatInputCommandInteraction<CacheType>) {
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
    const voteChannel = interaction.options.getChannel("channel");
    if (!voteChannel) return;
    if (voteChannel.type !== ChannelType.GuildText) return;
    await (voteChannel as TextChannel).send({
      embeds: [embed],
      components: [row],
    });

    // 투표 생성 완료 메시지 전송
    interaction.reply({
      content: "투표가 생성되었습니다.",
      ephemeral: true,
    });
  }

  // 투표 종료 커맨드
  @AddExecute("vote/close")
  async closeVote(interaction: any) {
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

    // 투표 ID 가져오기
    const voteId = interaction.options.getString("vote_id");
    if (!voteId) {
      interaction.reply({
        content: "투표 아이디를 입력해주세요.",
        ephemeral: true,
      });
      return;
    }

    // 투표 데이터 스토어에서 투표 정보 가져오기
    const store = new StoreManager("votes");
    const vote = store.get(voteId) as VoteData;

    // 투표가 존재하지 않는 경우
    if (!vote) {
      interaction.reply({
        content: "존재하지 않는 투표입니다.",
        ephemeral: true,
      });
      return;
    }

    // 이미 종료된 투표인 경우
    if (vote.closed) {
      interaction.reply({
        content: "이미 종료된 투표입니다.",
        ephemeral: true,
      });
      return;
    }

    // 투표 종료 처리
    vote.closed = true;
    store.set(voteId, vote);
    interaction.reply({
      content: "투표가 종료되었습니다.",
      ephemeral: true,
    });

    // 옵션 값 가져오기
    const mentionEveryone = interaction.options.getBoolean("mention_everyone");
    const channel = interaction.options.getChannel("channel");

    // 지정된 채널이 있는 경우
    if (channel) {
      // @everyone 멘션이 활성화된 경우
      if (mentionEveryone) {
        await channel?.send({
          content: "@everyone",
        });
      }

      // 투표 결과 임베드 생성
      const embed = new EmbedBuilder()
        .setColor("#eb7723")
        .setTitle("투표가 종료되었습니다.")
        .setDescription(
          `투표 타이틀:${
            vote.title
          } \n투표 id: ${voteId}\n \n **가장 많은 표를 받은 항목: ${
            // 가장 많은 표를 받은 항목 찾기
            Object.entries(vote.options).reduce(
              (max, [key, value]) =>
                value.count > max[1].count ? [key, value] : max,
              ["", { count: -1 }]
            )[0]
          }**\n\n`
        );
      await channel?.send({
        embeds: [embed],
      });
    } else {
      // 채널이 지정되지 않은 경우 현재 채널에 결과 표시
      if (mentionEveryone) {
        await interaction.channel?.send({
          content: "@everyone",
        });
      }

      // 투표 결과 임베드 생성
      const embed = new EmbedBuilder()
        .setColor("#eb7723")
        .setTitle("투표가 종료되었습니다.")
        .setDescription(
          `투표 타이틀:${
            vote.title
          } \n투표 id: ${voteId}\n \n **가장 많은 표를 받은 항목: ${
            // 가장 많은 표를 받은 항목 찾기
            Object.entries(vote.options).reduce(
              (max, [key, value]) =>
                value.count > max[1].count ? [key, value] : max,
              ["", { count: -1 }]
            )[0]
          }**\n\n`
        );

      // 각 투표 옵션별 결과 추가
      for (const option in vote.options) {
        embed.addFields({
          name: option,
          value: `${vote.options[option].count}회 클릭됨.`,
        });
      }

      store.delete(voteId);

      await interaction.channel?.send({
        embeds: [embed],
      });
    }
  }
}
