import { Client, Events, REST, Routes } from 'discord.js';
import { commands } from './commands';
import { GameManager } from './managers/GameManager';

export async function setupCommands(client: Client) {
  const gameManager = new GameManager();

  // Register commands
  client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    
    if (!client.user) {
      console.error('Client user is undefined');
      return;
    }

    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

    try {
      console.log('Started refreshing application (/) commands.');
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: [...commands.values()].map(command => command.data.toJSON()),
      });
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error refreshing commands:', error);
    }
  });

  // Handle command interactions
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, gameManager);
    } catch (error) {
      console.error('Error executing command:', error);
      await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true,
      });
    }
  });
}