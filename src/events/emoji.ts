import { MessageReaction, User, TextChannel } from "discord.js";

module.exports = {
  name: "messageReactionAdd",
  once: false,
  async execute(reaction: MessageReaction, user: User) {
    if (user.bot) return;

    const channel = reaction.message.channel as TextChannel;
    if (!channel) return;

    try {
      console.log(`${user.tag}님이 메시지에 반응을 추가했습니다!`);
    } catch (error) {
      console.error(`Could not send message to the channel.`, error);
    }
  },
};
