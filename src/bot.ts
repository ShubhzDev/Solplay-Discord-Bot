// src/bot.ts
import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  TextChannel,
  ComponentType,
} from "discord.js";
import {
  SendUnoJoinInvitationToAllPlayers,
  HandleInteractions,
  gameState,
  ShowDisplayButtons,
} from "./commands1"; // Import the command handling function
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Register the slash command
const commands = [
  {
    name: "uno",
    description: "Start a game of Uno",
    // options: [
    //   {
    //     name: "player1",
    //     description: "First player to join the game",
    //     type: 6, // ApplicationCommandOptionType.User
    //     required: true,
    //   },
    //   {
    //     name: "player2",
    //     description: "Second player to join the game",
    //     type: 6, // ApplicationCommandOptionType.User
    //     required: true,
    //   },
    // ],
  },
];

if (process.env.DISCORD_BOT_TOKEN) {
  const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN
  );

  client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    try {
      console.log("Started refreshing application (/) commands.");

      // Check if client.user is defined before using its id
      if (client.user) {
        await rest.put(Routes.applicationCommands(client.user.id), {
          body: commands,
        });
        console.log("Successfully reloaded application (/) commands.");
      } else {
        console.error("Client user is undefined. Cannot register commands.");
      }
    } catch (error) {
      console.error("Error registering commands:", error);
    }
  });

  // Handle interactions
  client.on(Events.InteractionCreate, async (interaction: any) => {
    console.log("interaction " + interaction);

    // if (!interaction.isCommand()) return;

    switch (interaction.commandName) {
      case "uno":
        SendUnoJoinInvitationToAllPlayers(interaction);
        break;
      // case "join":
      //   ShowDisplayButtons(interaction);
      //   break;
      default:
      // await interaction.reply({
      //   content: "Unknown command.",
      //   ephemeral: true,
      // });
    }

    if (interaction.isButton()) {
      await interaction.deferReply();
      console.log("interaction.customId " + interaction.customId);
      // if (interaction.customId === "join") {
      //   if (gameState.players.length == 2) {
      //     //start game
      //     DisplayPlayerOwnCards(interaction, player, gameState);
      //   } else if (gameState.players.length < 2) {
      //     ShowDisplayButtons(interaction);
      //   }
      // } else if (interaction.customId === "view") {
      // } else if (interaction.customId === "view") {
      //   // DisplayPlayerOwnCards(interaction);
      // }
      HandleInteractions(interaction,interaction.channel);
    }
  });

  // Start the bot
  client.login(process.env.DISCORD_BOT_TOKEN);
} else {
  console.error("DISCORD_BOT_TOKEN environment variable is not defined.");
}
