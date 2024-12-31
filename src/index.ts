import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { setupCommands } from './bot';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

setupCommands(client);

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('DISCORD_BOT_TOKEN is not defined in .env file');
  process.exit(1);
}

client.login(token).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});