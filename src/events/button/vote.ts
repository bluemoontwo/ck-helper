import { ButtonInteraction, EmbedBuilder } from "discord.js";
import StoreManager from "../../util/manange-store";
import { VoteData } from "../../types/vote";

module.exports = {
  check: (interaction: ButtonInteraction) => {
    return interaction.customId.startsWith("vote_");
  },
  execute: async (interaction: ButtonInteraction) => {
    const params = interaction.customId.split("_");
    const voteId = params[1];
    const option = params[2];
    const store = new StoreManager("votes");
    const vote = store.get(voteId) as VoteData;
    if (!vote) return;
    if (vote.closed) {
      const embed = new EmbedBuilder()
        .setColor("#eb2323")
        .setTitle("이미 종료된 투표입니다.")
        .setDescription(`투표의 결과는 다음과 같았습니다.`);
      for (const option in vote.options) {
        embed.addFields({
          name: option,
          value: `${vote.options[option].count}회 클릭됨.`,
        });
      }
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }
    if (vote.votedUser.includes(interaction.user.id)) {
      const embed = new EmbedBuilder()
        .setColor("#eb2323")
        .setTitle("중복 투표는 허용되지 않습니다.")
        .setDescription(`이미 투표하셨습니다.`);
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      return;
    }

    vote.votedUser.push(interaction.user.id);
    vote.options[option].count++;
    store.set(voteId, vote);

    interaction.reply({
      content: "투표가 완료되었습니다.",
      ephemeral: true,
    });
  },
};
