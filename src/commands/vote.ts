import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  CacheType,
  TextChannel,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import StoreManager from "../util/manange-store";
import { VoteData } from "../types/vote";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start-vote")
    .setDescription("새로운 투표를 생성합니다.")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("투표의 제목을 입력합니다.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("투표의 설명을 입력합니다.")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("투표를 보낼 채널을 선택합니다.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("options_count")
        .setDescription("투표 항목의 개수를 입력합니다 (최대 10개)")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(10)
    )
    .addStringOption((option) =>
      option
        .setName("option1")
        .setDescription("첫 번째 투표 항목")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setDescription("두 번째 투표 항목")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("option3")
        .setDescription("세 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option4")
        .setDescription("네 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option5")
        .setDescription("다섯 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option6")
        .setDescription("여섯 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option7")
        .setDescription("일곱 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option8")
        .setDescription("여덟 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option9")
        .setDescription("아홉 번째 투표 항목")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("option10")
        .setDescription("열 번째 투표 항목")
        .setRequired(false)
    ),

  async execute(
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | MessageContextMenuCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
  ) {
    const store = new StoreManager("votes");
    const channel = interaction.channel as TextChannel;
    if (!channel) {
      interaction.reply({
        content: "채널을 선택해주세요.",
        ephemeral: true,
      });
      return;
    }
    if (!("options" in interaction)) return;

    const title = (
      interaction as ChatInputCommandInteraction
    ).options.getString("title");
    const description = (
      interaction as ChatInputCommandInteraction
    ).options.getString("description");

    const voteId = `${Date.now()}`;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("#eb7723")
      .setFooter({
        text: `vote id: ${voteId}`,
      })
      .setTimestamp();

    const optionsCount = (
      interaction as ChatInputCommandInteraction
    ).options.getInteger("options_count");
    if (!optionsCount) return;

    const row = new ActionRowBuilder<ButtonBuilder>();

    let voteData: VoteData = {
      title: title || "",
      votedUser: [],
      options: {},
      closed: false,
    };

    for (let i = 1; i <= optionsCount; i++) {
      const buttonLabel = (
        interaction as ChatInputCommandInteraction
      ).options.getString(`option${i}`);
      if (!buttonLabel) return;
      const button = new ButtonBuilder()
        .setCustomId(`vote_${voteId}_${buttonLabel}`)
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary);
      row.addComponents(button);
      voteData.options[buttonLabel] = { count: 0 };
    }

    store.set(voteId, voteData);

    const voteChannel = (
      interaction as ChatInputCommandInteraction
    ).options.getChannel("channel");
    if (!voteChannel) return;
    if (!(voteChannel instanceof TextChannel)) return;
    await voteChannel.send({
      embeds: [embed],
      components: [row],
    });

    interaction.reply({
      content: "투표가 생성되었습니다.",
      ephemeral: true,
    });
  },
};
