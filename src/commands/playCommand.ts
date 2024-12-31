import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameManager } from '../managers/GameManager';
import { isValidPlay } from '../gameState';

export const playCommand = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a card')
    .addStringOption(option =>
      option
        .setName('card')
        .setDescription('The card to play (e.g., "red 7", "blue skip")')
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction, gameManager: GameManager) {
    const gameId = `game_${interaction.guildId}`;
    const gameState = gameManager.getGameState(gameId);
    
    if (!gameState || !gameState.isActive) {
      await interaction.reply({ 
        content: 'No active game found!', 
        ephemeral: true 
      });
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== interaction.user.id) {
      await interaction.reply({ 
        content: 'It\'s not your turn!', 
        ephemeral: true 
      });
      return;
    }

    // Add card playing logic here
    await interaction.reply('Card played!');
  }
};