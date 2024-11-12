import { GuildMember } from "discord.js";

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member: GuildMember) {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    const welcomeMessage = `환영합니다, ${member}! 서버에 오신 것을 환영합니다!`;
    await channel.send(welcomeMessage);
  },
};
