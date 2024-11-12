import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { VoteData } from "../types/vote";
import StoreManager from "../util/manange-store";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close-vote")
    .setDescription("투표를 종료합니다.")
    .addStringOption((option) =>
      option
        .setName("vote_id")
        .setDescription("종료할 투표의 아이디를 입력합니다.")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("mention_everyone")
        .setDescription("모든 사람에게 투표 결과 공개 알림을 보냅니다.")
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("투표 결과 공개 알림을 보낼 채널을 선택합니다.")
        .setRequired(false)
    ),
  async execute(interaction: any) {
    const voteId = interaction.options.getString("vote_id");
    if (!voteId) {
      interaction.reply({
        content: "투표 아이디를 입력해주세요.",
        ephemeral: true,
      });
      return;
    }
    const store = new StoreManager("votes");
    const vote = store.get(voteId) as VoteData;
    if (!vote) {
      interaction.reply({
        content: "존재하지 않는 투표입니다.",
        ephemeral: true,
      });
      return;
    }
    if (vote.closed) {
      interaction.reply({
        content: "이미 종료된 투표입니다.",
        ephemeral: true,
      });
      return;
    }
    vote.closed = true;
    store.set(voteId, vote);
    interaction.reply({
      content: "투표가 종료되었습니다.",
      ephemeral: true,
    });
    const mentionEveryone = interaction.options.getBoolean("mention_everyone");
    const channel = interaction.options.getChannel("channel");

    if (channel) {
      if (mentionEveryone) {
        await channel?.send({
          content: "@everyone",
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#eb7723")
        .setTitle("투표가 종료되었습니다.")
        .setDescription(
          `투표 타이틀:${
            vote.title
          } \n투표 id: ${voteId}\n \n **가장 많은 표를 받은 항목: ${
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
      if (mentionEveryone) {
        await interaction.channel?.send({
          content: "@everyone",
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#eb7723")
        .setTitle("투표가 종료되었습니다.")
        .setDescription(
          `투표 타이틀:${
            vote.title
          } \n투표 id: ${voteId}\n \n **가장 많은 표를 받은 항목: ${
            Object.entries(vote.options).reduce(
              (max, [key, value]) =>
                value.count > max[1].count ? [key, value] : max,
              ["", { count: -1 }]
            )[0]
          }**\n\n`
        );

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
