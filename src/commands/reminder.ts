import { SlashCommandBuilder } from "discord.js";
import StoreManager from "../util/manange-store";
import { Reminder, ReminderTime } from "../types/reminder";
import {AddExecute, CommandData, InteractionHandler} from "../util/interaction-handler";

@CommandData(
  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("요청한 시간에 맞춰 알림을 보냅니다.")
    .addStringOption((option) =>
      option
        .setName("시간")
        .setDescription(
          "알림을 받을 시간을 입력합니다. 년/월/일/시/분 형식으로 입력합니다. ex ) 2025/01/01/09/00"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("타이틀")
        .setDescription("알림의 타이틀을 입력합니다.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("설명")
        .setDescription("알림의 설명을 입력합니다.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("채널")
        .setDescription("알림을 보낼 채널을 입력해 주세요!")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("mention-everyone")
        .setDescription("에브리원 멘션을 하실 건가요?")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("mention-author")
        .setDescription("작성자 멘션을 하실 건가요?")
        .setRequired(false)
    )
    .toJSON()
)
@InteractionHandler()
export default class ReminderCommand {
  @AddExecute("remind")
  async execute(interaction: any) {
    const time = interaction.options.getString("시간");
    if (!time) return;

    const reminderTime: number[] = time
      .split("/")
      .map((t: string): number => parseInt(t));
    if (reminderTime.length !== 5) {
      interaction.reply({
        content: "시간 형식이 올바르지 않습니다.",
        ephemeral: true,
      });
      return;
    }
    const dateToRemind = new Date(
      reminderTime[0],
      reminderTime[1] - 1,
      reminderTime[2],
      reminderTime[3],
      reminderTime[4]
    );

    if (dateToRemind.getTime() < Date.now()) {
      interaction.reply({
        content: "이미 지난 시간입니다.",
        ephemeral: true,
      });
      return;
    }

    const store = new StoreManager("reminder");
    const title = interaction.options.getString("타이틀");
    const description = interaction.options.getString("설명");
    const currentTime = dateToRemind.getTime().toString().slice(0, -4);
    let currentReminders = (store.get(currentTime) as Reminder[]) || [];
    const mention = {
      everyone: interaction.options.getBoolean("mention-everyone"),
      author: interaction.options.getBoolean("mention-author"),
    };
    store.set(currentTime, [
      ...currentReminders,
      {
        title: title,
        description: description,
        authorId: interaction.user.id,
        channelId:
          interaction.options.getChannel("채널")?.id || interaction.channelId,
        guildId: interaction.guildId,
        time: time,
        mention: mention,
      },
    ]);
    interaction.reply({
      content: `${dateToRemind.getFullYear()}년 ${
        dateToRemind.getMonth() + 1
      }월 ${dateToRemind.getDate()}일 ${dateToRemind.getHours()}시 ${dateToRemind.getMinutes()}분으로 알람을 설정했습니다.`,
      ephemeral: true,
    });
  }
}
