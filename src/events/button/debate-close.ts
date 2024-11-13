import {
  ButtonInteraction,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import StoreManager from "../../util/manange-store";
import { DebateData } from "../../types/debate";
import { makeDebateHtml } from "../../util/make-debateHtml";

module.exports = {
  check: (interaction: ButtonInteraction) => {
    try {
      return interaction.customId.startsWith("debate-close_");
    } catch (error) {
      console.error("커스텀 ID 확인 중 오류:", error);
      return false;
    }
  },
  execute: async (interaction: ButtonInteraction) => {
    try {
      const debateId = interaction.customId.split("_")[1];
      const store = new StoreManager("debate");
      const debate = store.get(debateId) as DebateData;
      if (!debate) {
        await interaction.reply({
          content: "회의를 종료할 수 없습니다.",
          ephemeral: true,
        });
        return;
      }

      if (
        !interaction.memberPermissions?.has(
          PermissionsBitField.Flags.Administrator
        ) &&
        interaction.user.id !== debate.author
      ) {
        await interaction.reply({
          content: "권한이 없습니다.",
          ephemeral: true,
        });
        return;
      }

      debate.closed = true;

      const channel = interaction.guild?.channels.cache.get(debate.channel);
      if (!(channel instanceof TextChannel)) {
        await interaction.reply({
          content: "회의를 종료할 수 없습니다.",
          ephemeral: true,
        });
        return;
      }

      try {
        const attachment = makeDebateHtml(debate, interaction);

        const triggerMessage = await channel.messages.fetch(
          debate.triggerMessage
        );
        if (triggerMessage) {
          await triggerMessage.edit({
            content: "회의를 종료하였습니다. 회의 기록은 아래를 참고해 주세요.",
            files: [attachment],
          });
        }

        await interaction.reply({
          content: "회의를 종료하였습니다.",
        });

        const thread = interaction.guild?.channels.cache.get(debate.threadId);
        if (thread) {
          await thread.delete();
          store.delete(debateId);
        } else {
          store.set(debateId, debate);
        }
      } catch (error) {
        console.error("회의록 생성 중 오류:", error);
      }
    } catch (error) {
      console.error("예기치 못한 오류:", error);
    }
  },
};
