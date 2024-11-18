import {CacheType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder,} from "discord.js";
import StoreManager from "../util/manange-store";
import {WelcomeData} from "../types/welcome";
import {AddExecute, CommandData, InteractionHandler} from "../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("welcome") // 커맨드 이름 설정
    .setDescription("환영 메시지를 설정합니다.") // 커맨드 설명
    .addSubcommandGroup((option) =>
      option
        .setName("set-format")
        .setDescription("환영 메세지 포멧을 설정합니다.")
        .addSubcommand((option) =>
          option
            .setName("system")
            .setDescription("시스템 채널에 보낼 메세지 형식을 설정합니다.")
            .addStringOption(
              (option) =>
                option
                  .setName("message")
                  .setDescription("환영 메시지를 입력합니다.")
                  .setRequired(true) // 필수 입력 옵션
            )
        )
        .addSubcommand((option) =>
          option
            .setName("dm")
            .setDescription("DM 채널에 보낼 메세지 형식을 설정합니다.")
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
            )
        )
    )
    .toJSON()
)
@InteractionHandler()
export default class WelcomeCommand {

  // 시스템 채널에 보낼 메세지 형식 설정
  @AddExecute("welcome/set-format/system")
  async setWelcomeFormatSystem(interaction: ChatInputCommandInteraction<CacheType>) {
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
  }

  // DM 채널에 보낼 메세지 형식 설정
  @AddExecute("welcome/set-format/dm")
  async setWelcomeFormatDM(interaction: ChatInputCommandInteraction<CacheType>) {
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
  }
}
