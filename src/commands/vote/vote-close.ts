import {
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import { VoteData } from "../../types/vote";
import StoreManager from "../../util/manange-store";

module.exports = {
  // 슬래시 커맨드 정의
  data: new SlashCommandBuilder()
    .setName("close-vote") // 커맨드 이름
    .setDescription("투표를 종료합니다.") // 커맨드 설명
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
    ),

  // 커맨드 실행 함수
  async execute(interaction: any) {
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

      await interaction.channel?.send({
        embeds: [embed],
      });
    }
  },
};
