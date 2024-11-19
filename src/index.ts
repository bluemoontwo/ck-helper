import {ActivityType, Client, Collection, GatewayIntentBits, REST,} from "discord.js";
import {readdirSync} from "fs";
import {join} from "path";
import StoreManager from "./util/manange-store";
import {registReminder} from "./util/reminder";
import {RESTPostAPIApplicationCommandsJSONBody, Routes} from "discord-api-types/v10";
import {InteractionCallbackManager} from "./util/interaction-handler";
import consola from "consola";

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.DISCORD_TOKEN || "";
const clientId = process.env.CLIENT_ID || "";

const rest = new REST({version: "10"}).setToken(token);

// InteractionCallbackManager 를 저장할 Collection 생성
const commands: Collection<string, InteractionCallbackManager> = new Collection();
const components: InteractionCallbackManager[] = [];

client.once("ready", async () => {
  if (process.env.NODE_ENV === "production") {
    consola.info("Bot is currently running in production mode");
  }

  // 현재 플래이 중인 게임을 설정
  client.user?.setActivity("이 봇은 청강대 공식 봇이 아닙니다.", {
    type: ActivityType.Custom,
  });
  client.user?.setStatus("idle");

  const getAllScriptFiles = (dir: string): string[] => {
    let files: string[] = [];
    const items = readdirSync(join(__dirname, dir), {withFileTypes: true});

    for (const item of items) {
      if (item.isDirectory()) {
        files = [...files, ...getAllScriptFiles(`${dir}/${item.name}`)];
      } else if (
        item.isFile() &&
        (item.name.endsWith(".js") || item.name.endsWith(".ts"))
      ) {
        files.push(`${dir}/${item.name}`);
      }
    }
    return files;
  };

  // 커맨드 파일 가져오기
  const commandFiles = getAllScriptFiles("commands");

  let commandData: RESTPostAPIApplicationCommandsJSONBody[] = [];

  for (const file of commandFiles) {
    const obj = await import(`./${file}`);

    const prototype = obj.default.prototype;
    if (Reflect.hasMetadata("discord:interaction", prototype) && Reflect.hasMetadata("discord:command", prototype)) {
      const data = Reflect.getMetadata("discord:command", prototype) as RESTPostAPIApplicationCommandsJSONBody;
      const manager = Reflect.getMetadata("discord:interaction", prototype) as InteractionCallbackManager;

      commandData.push(data);
      commands.set(data.name, manager);
    }
  }

  // 컴포넌트 파일 가져오기
  const componentFiles = getAllScriptFiles("components");

  for (const file of componentFiles) {
    const obj = await import(`./${file}`);

    const prototype = obj.default.prototype;
    if (Reflect.hasMetadata("discord:interaction", prototype)) {
      const manager = Reflect.getMetadata("discord:interaction", prototype) as InteractionCallbackManager;
      components.push(manager);
    }
  }

  new StoreManager("global");

  consola.info("Successfully set global store.");

  if (commandData.length > 0) {
    try {
      consola.info("Started refreshing application (/) commands.");

      await rest.put(
        Routes.applicationCommands(clientId),
        {body: commandData},
      );

      consola.info(`Successfully reloaded application ${commandFiles.length} (/) commands.`);
    } catch (error) {
      consola.error(error);
    }
  }

  client.on("interactionCreate", (interaction) => {
    if (interaction.isCommand()) {
      let key = interaction.commandName;
      const command = commands.get(key);

      if (!command) {
        return;
      }

      if (interaction.isChatInputCommand()) {
        const groupName = interaction.options.getSubcommandGroup();
        const subcommandName = interaction.options.getSubcommand(false);

        key += groupName ? "/" + groupName : "";
        key += subcommandName ? "/" + subcommandName : "";
      }

      command.call(key, interaction);
    }

    if (interaction.isMessageComponent()) {
      for (const component of components) {
        const customId = interaction.customId.split("_")[0];
        if (component.contain(customId)) {
          component.call(customId, interaction);
          return;
        }
      }
    }
  });
});

// 이벤트 파일을 읽어와서 등록
const eventFiles = readdirSync(join(__dirname, "events")).filter(
  (file) => file.endsWith(".js") || file.endsWith(".ts")
);

for (const file of eventFiles) {
  consola.info(`registering event ${file}`);
  const event = require(`./events/${file}`);
  if (!event) {
    consola.error(`Failed to load event from file: ${file}`);
    continue;
  }
  event.register(client);
}

registReminder(client);

client.login(token);
