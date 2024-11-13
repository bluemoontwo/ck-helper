import {
  ChatInputCommandInteraction,
  CacheType,
  SlashCommandBuilder,
  PermissionsBitField,
} from "discord.js";
import StoreManager from "../../util/manange-store";
import { WelcomeData } from "../../types/welcome";

module.exports = {
  // 슬래시 커맨드 정의
  data: new SlashCommandBuilder()
    .setName("set-welcome") // 커맨드 이름 설정
    .setDescription("환영 메시지를 설정합니다.") // 커맨드 설명
    .addStringOption(
      (option) =>
        option
          .setName("message")
          .setDescription("환영 메시지를 입력합니다.")
          .setRequired(true) // 필수 입력 옵션
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
    // 사용자가 입력한 메시지 가져오기
    const message = interaction.options.getString("message");
    // welcome 저장소 인스턴스 생성
    const store = new StoreManager("welcome");
    // 현재 서버의 환영 메시지 데이터 가져오기
    let welcomeMessage = store.get(interaction.guildId || "") as WelcomeData;

    // 환영 메시지가 없는 경우 새로 생성
    if (!welcomeMessage) {
      welcomeMessage = {
        toSystemChannel: message || undefined,
      };
    } else {
      // 기존 환영 메시지 업데이트
      welcomeMessage.toSystemChannel = message || undefined;
    }
    // 변경된 환영 메시지 저장
    store.set(interaction.guildId || "", welcomeMessage);

    // 설정 완료 응답
    interaction.reply({
      content: "환영 메시지를 설정하였습니다.",
    });
  },
};
