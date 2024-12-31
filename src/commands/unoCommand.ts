import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameManager } from '../managers/GameManager';

export const unoCommand = {
  data: new SlashCommandBuilder()
    .setName('uno')
    .setDescription('Start a game of Uno'),

  async execute(interaction: CommandInteraction, gameManager: GameManager) {
    const gameId = `game_${interaction.guildId}`;
    const userId = interaction.user.id;
    const userName = interaction.user.username;

    if (!gameManager.getGameState(gameId)) {
      gameManager.createGame(gameId);
    }

    gameManager.addPlayer(userId, userName, gameId);
    await interaction.reply(`${userName} has started/joined an UNO game!`);
  }
};