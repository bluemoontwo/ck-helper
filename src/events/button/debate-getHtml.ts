import { ButtonInteraction } from "discord.js";
import StoreManager from "../../util/manange-store";
import { DebateData } from "../../types/debate";
import fs from "fs";
import { makeDebateHtml } from "../../util/make-debateHtml";

module.exports = {
  // 버튼 상호작용이 debate-html_ 으로 시작하는지 확인하는 함수
  check: (interaction: ButtonInteraction) => {
    try {
      return interaction.customId.startsWith("debate-html_");
    } catch (error) {
      interaction.reply({
        content: "커스텀 ID를 확인하는 중 오류가 발생했습니다.",
        ephemeral: true,
      });
      return false;
    }
  },
  // 버튼 클릭 시 실행되는 메인 함수
  execute: async (interaction: ButtonInteraction) => {
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
  },
};
