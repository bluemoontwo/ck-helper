import { CacheType, PermissionsBitField } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import { WelcomeData } from "../../types/welcome";
import StoreManager from "../../util/manange-store";

module.exports = {
  // 슬래시 커맨드 정의
  data: new SlashCommandBuilder()
    .setName("set-welcome-user") // 커맨드 이름 설정
    .setDescription("유저에게 환영 메시지를 보냅니다.") // 커맨드 설명 설정
    .addStringOption(
      (option) =>
        option
          .setName("title") // 제목 옵션 추가
          .setDescription("환영 메시지의 제목을 입력합니다.")
          .setRequired(true) // 필수 입력 항목으로 설정
    )
    .addStringOption(
      (option) =>
        option
          .setName("description") // 설명 옵션 추가
          .setDescription("환영 메시지의 설명을 입력합니다.")
          .setRequired(true) // 필수 입력 항목으로 설정
    ),

  // 커맨드 실행 함수
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
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
    // 사용자가 입력한 제목과 설명을 가져옴
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");

    // 환영 메시지 저장소 초기화
    const store = new StoreManager("global");

    // 현재 서버의 환영 메시지 데이터를 가져옴
    const welcomeMessage = store.get(
      interaction.guildId + ".welcome" || ""
    ) as WelcomeData;

    // 환영 메시지가 설정되어 있지 않은 경우 에러 메시지 반환
    if (!welcomeMessage) {
      interaction.reply({
        content: "환영 메시지가 설정되어 있지 않습니다.",
        ephemeral: true,
      });
      return;
    }

    // 새로운 환영 메시지 설정
    welcomeMessage.toUser = {
      title: title || undefined,
      description: description || undefined,
    };

    // 변경된 환영 메시지를 저장소에 저장
    store.set(interaction.guildId || "", welcomeMessage);

    // 성공 메시지 전송
    interaction.reply({
      content: "유저에게 보낼 환영 메시지를 설정하였습니다.",
    });
  },
};
