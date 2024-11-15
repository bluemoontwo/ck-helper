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
    if (!vote) {
      interaction.reply({
        content: "이미 종료된 투표입니다.",
        ephemeral: true,
      });
      return;
    }
    if (vote.votedUser.includes(interaction.user.id)) {
      interaction.reply({
        content: "중복 투표는 허용되지 않습니다.",
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
