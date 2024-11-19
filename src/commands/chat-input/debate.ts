import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder, PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import StoreManager from "../../util/manange-store";
import {DebateData} from "../../types/debate";
import {Palette} from "../../util/color-palette";
import {AddExecute, CommandData, InteractionHandler} from "../../util/interaction-handler";
import {InteractionContextType} from "discord-api-types/v10";
import {makeDebateHtml} from "../../util/make-debateHtml";
import consola from "consola";

@CommandData(
  new SlashCommandBuilder()
    .setName("debate")
    .setNameLocalization("ko", "회의")
    .setDescription("회의와 관련된 조작을 할 수 있습니다")
    .setContexts(InteractionContextType.Guild)
    // 회의 시작 커맨드
    .addSubcommand((option) =>
      option
        .setName("start")
        .setNameLocalization("ko", "시작")
        .setDescription("회의실을 만들어서 회의를 진행 할 수 있습니다")
        // 필수 옵션
        .addStringOption((option) =>
          option
            .setName("topic")
            .setNameLocalization("ko", "주제")
            .setDescription("회의 주제를 입력해주세요")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("description")
            .setNameLocalization("ko", "설명")
            .setDescription("회의 주제에 대한 설명을 입력해주세요")
            .setRequired(true)
        )
        // 선택 옵션
        .addStringOption((option) =>
          option
            .setName("room-name")
            .setNameLocalization("ko", "방이름")
            .setDescription("회의실의 이름을 입력해주세요")
            .setRequired(false)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setNameLocalization("ko", "카테고리")
            .setDescription("회의실을 생성할 카테고리를 입력해주세요")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
    )
    // 회의 종료 커맨드
    .addSubcommand((option) =>
      option
        .setName("close")
        .setNameLocalization("ko", "종료")
        .setDescription("회의를 닫습니다.")
        .addStringOption((option) =>
          option
            .setName("debate-id")
            .setNameLocalization("ko", "회의-아아디")
            .setDescription("회의 아이디를 입력해주세요.")
            .setRequired(true)
        )
    )
    .toJSON()
)
@InteractionHandler()
export default class Debate {
  @AddExecute("debate/start")
  async startDebate(interaction: ChatInputCommandInteraction) {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "서버 텍스트 채널에서 사용해주세요!",
        ephemeral: true,
      });
    }

    const replyMessage = await interaction.reply({
      content: "회의실을 생성하고 있습니다..",
      ephemeral: true,
    });

    const topic = interaction.options.getString("topic")!;
    const description = interaction.options.getString("description")!;

    const category: CategoryChannel | null = interaction.options.getChannel("category");

    const _rawRoomName = interaction.options.getString("room-name");
    const roomName = _rawRoomName ? _rawRoomName : `${interaction.user.username}님의 회의실`;

    const store = new StoreManager("debate");

    if (!interaction.guild) return;

    // 회의실 채널 생성
    const debateChan = await interaction.guild.channels.create({
      name: roomName,
      type: ChannelType.GuildVoice,
      parent: category ? category.id : null,
      reason: `${interaction.user.username}님이 회의를 시작하였습니다`,
    });

    if (!debateChan) {
      return interaction.reply({
        content: "회의실 생성에 실패했습니다..",
        ephemeral: true,
      });
    }

    // 회의 시작 알림 임베드 생성
    const triggerEmbed = new EmbedBuilder()
      .setTitle("새로운 회의가 시작되었습니다")
      .setFooter({
        text: `Debate ID: ${debateChan.id}`,
      })
      .setColor(Palette.CHUNG_KANG);

    // 회의실 바로가기 버튼 생성
    const triggerMsgRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder({
          label: "회의실 바로가기",
          style: ButtonStyle.Link,
          url: debateChan?.url
        })
      );

    const triggerMessage = await interaction.channel.send({
      embeds: [triggerEmbed], components: [triggerMsgRow]
    });

    // 회의 데이터 구조 생성
    const debateData = (store.get(debateChan.id) ||
      {
        roomName: roomName,
        author: interaction.user.id,
        topic: topic || "",
        description: description || "",
        interactionChannelId: interaction.channelId,
        triggerMessageId: triggerMessage.id,
        categoryId: category?.id,
        channelId: debateChan?.id,
        messages: [],
        closed: false,
      }
    ) as DebateData;

    // 회의 데이터 저장
    store.set(debateChan.id, debateData);

    // 회의 안내 임베드 생성
    const infoEmbed = new EmbedBuilder()
      .setTitle(topic || "")
      .setDescription(description || "")
      .setFooter({
        text: "모든 회의 내용은 기록되며, 이후 html 형식으로 제공됩니다",
      })
      .setColor(Palette.CHUNG_KANG);

    // 회의 제어 버튼 생성
    const infoMsgRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder({
          customId: `debate-close_${debateChan.id}`,
          label: "회의 종료",
          style: ButtonStyle.Danger,
        })
      )
      .addComponents(
        new ButtonBuilder({
          customId: `debate-html_${debateChan.id}`,
          label: "회의록 다운로드",
          style: ButtonStyle.Secondary,
        })
      );

    // 채널에 초기 메시지 전송
    debateChan?.send({embeds: [infoEmbed], components: [infoMsgRow]});

    replyMessage.edit({
      content: "회의실을 생성했습니다!"
    });
  }

  @AddExecute("debate/close")
  async closeDebate(interaction: ChatInputCommandInteraction) {
    try {
      const debateId = interaction.options.getString("debate-id");
      if (!debateId) {
        return;
      }

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
}
