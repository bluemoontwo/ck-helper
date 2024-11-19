import {ButtonInteraction, ChannelType, EmbedBuilder, PermissionsBitField,} from "discord.js";
import StoreManager from "../../util/manange-store";
import {DebateData} from "../../types/debate";
import {makeDebateHtml} from "../../util/make-debateHtml";
import {AddExecute, InteractionHandler} from "../../util/interaction-handler";
import consola from "consola";

@InteractionHandler()
export default class DebateButton {

  // 회의 종료 버튼
  @AddExecute("debate-close")
  async closeDebate(interaction: ButtonInteraction) {
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

      const channel = interaction.guild?.channels.cache.get(debate.interactionChannelId);
      if (channel?.type !== ChannelType.GuildText) {
        await interaction.reply({
          content: "회의를 종료할 수 없습니다.",
          ephemeral: true,
        });
        return;
      }

      try {
        const attachment = makeDebateHtml(debate, interaction);

        const triggerMessage = await channel.messages.fetch(
          debate.triggerMessageId
        );

        const embed = new EmbedBuilder(triggerMessage.embeds[0].data)
          .setTitle("회의가 종료되었습니다.")
          .setDescription("회의 결과를 다운로드 받아 확인할 수 있습니다.");

        if (triggerMessage) {
          await triggerMessage.edit({
            files: [attachment],
            embeds: [embed],
            components: []
          });
        }

        await interaction.reply({
          content: "회의를 종료하였습니다.",
        });

        const voiceChan = interaction.guild?.channels.cache.get(debate.channelId);
        if (voiceChan) {
          await voiceChan.delete();
          store.delete(debateId);
        } else {
          store.set(debateId, debate);
        }
      } catch (error) {
        consola.error("회의록 생성 중 오류:", error);
      }
    } catch (error) {
      consola.error("예기치 못한 오류:", error);
    }
  }

  // 회의록 가져오기 버튼
  @AddExecute("debate-html")
  async getHtml(interaction: ButtonInteraction) {
    try {
      // 디베이트 ID 추출 및 스토어에서 데이터 가져오기
      const debateId = interaction.customId.split("_")[1];
      const store = new StoreManager("debate");

      const debate = store.get(debateId) as DebateData;
      // 디베이트 데이터가 없는 경우 에러 처리
      if (!debate) {
        try {
          await interaction.reply({
            content: "회의록을 불러올 수 없습니다.",
            ephemeral: true,
          });
          return;
        } catch (error) {
          await interaction.reply({
            content: "응답을 보내는 중 오류가 발생했습니다.",
            ephemeral: true,
          });
          return;
        }
      }

// 초기 응답 전송
      try {
        await interaction.reply({
          content: "회의록 만드는 중..",
          ephemeral: true,
        });
      } catch (error) {
        await interaction.reply({
          content: "응답을 보내는 중 오류가 발생했습니다.",
          ephemeral: true,
        });
        return;
      }

      try {
        const attachment = makeDebateHtml(debate, interaction);

        // 채널 유효성 검사
        if (!interaction.channel) {
          await interaction.followUp({
            content: "채널을 찾을 수 없습니다.",
            ephemeral: true,
          });
          return;
        }
        if (!("send" in interaction.channel)) {
          await interaction.followUp({
            content: "메시지를 보낼 수 없는 채널입니다.",
            ephemeral: true,
          });
          return;
        }

        // 생성된 HTML 파일 전송
        try {
          await interaction.followUp({
            content: "회의록이 생성되었습니다.",
            files: [attachment],
            ephemeral: true,
          });
        } catch (error) {
          await interaction.followUp({
            content: "파일 전송 중 오류가 발생했습니다.",
            ephemeral: true,
          });
          return;
        }

        // 디베이트 데이터 저장
        try {
          store.set(debateId, debate);
        } catch (error) {
          await interaction.followUp({
            content: "데이터 저장 중 오류가 발생했습니다.",
            ephemeral: true,
          });
        }
      } catch (error) {
        await interaction.followUp({
          content: "회의록 생성 중 오류가 발생했습니다.",
          ephemeral: true,
        });
      }
    } catch (error) {
      await interaction.followUp({
        content: "예기치 못한 오류가 발생했습니다.",
        ephemeral: true,
      });
    }
  }
}
