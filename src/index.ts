import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Interaction,
  Collection,
  ActivityType,
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
});

const token = process.env.DISCORD_TOKEN || "";
const clientId = process.env.CLIENT_ID || "";

const rest = new REST({ version: "10" }).setToken(token);

// 커맨드를 저장할 Collection 생성
const commands = new Collection();

client.once("ready", async () => {
  console.log("Bot is online and ready with slash commands!");

  // 현재 플래이 중인 게임을 설정
  client.user?.setActivity("이 봇은 청강대 공식 봇이 아닙니다.", {
    type: ActivityType.Custom,
  });
  client.user?.setStatus("invisible");

  const commandFiles = readdirSync(join(__dirname, "commands")).filter(
    (file) => file.endsWith(".js") || file.endsWith(".ts")
  );

  // 커맨드들을 Collection에 저장 및 JSON 변환
  const commandsArray = commandFiles.map((file) => {
    const command = require(`./commands/${file}`);
    commands.set(command.data.name, command);
    return command.data.toJSON();
  });

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commandsArray,
    });

    console.log(
      `Successfully reloaded application ${commandFiles.length} (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
});

// 이벤트 파일을 읽어와서 등록
const eventFiles = readdirSync(join(__dirname, "events")).filter(
  (file) => file.endsWith(".js") || file.endsWith(".ts")
);

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (error) {
        console.error(`Error executing event ${event.name}:`, error);
      }
    });
  } else {
    client.on(event.name, async (...args) => {
      try {
        await event.execute(...args);
      } catch (error) {
        console.error(`Error executing event ${event.name}:`, error);
      }
    });
  }
}

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await (command as any).execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
