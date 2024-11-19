import { Client, EmbedBuilder, GuildMember, TextChannel } from "discord.js";
import StoreManager from "../util/manange-store";
import { WelcomeData } from "../types/welcome";
import {Palette} from "../util/color-palette";
import consola from "consola";

module.exports = {
  name: "Welcome",
  register: (client: Client) => {
    client.on("guildMemberAdd", async (member: GuildMember) => {
      const systemChannel = member.guild.systemChannel as TextChannel;
      const welcomeStore = new StoreManager("welcome");

      const welcomeMessage = welcomeStore.get(member.guild.id) as WelcomeData;

      if (!welcomeMessage) return;

      if (!systemChannel) {
        consola.error("Could not find system channel.");
        return;
      }

      if (welcomeMessage.toSystemChannel) {
        try {
          await systemChannel.send(
            welcomeMessage.toSystemChannel.replace(
              "${user}",
              member.user.username
            )
          );
        } catch (error) {
          consola.error(`Error sending message to system channel: ${error}`);
        }
      }

      if (welcomeMessage.toUser) {
        try {
          const embed = new EmbedBuilder()
            .setColor(Palette.CHUNG_KANG)
            .setTitle(
              welcomeMessage.toUser?.title?.replace(
                "${user}",
                member.user.username
              ) || "환영합니다!"
            )
            .setDescription(
              welcomeMessage.toUser?.description
                ?.replace("${user}", member.user.username)
                .replace(/\\n/g, "\n") ||
                `${member.user.tag}님, 서버에 오신 것을 환영합니다!`
            );
          await member.send({ embeds: [embed] });
        } catch (error) {
          consola.error(`Error sending message to user: ${error}`);
        }
      }
    });
    consola.error(`registered welcome event`);
  },
};
