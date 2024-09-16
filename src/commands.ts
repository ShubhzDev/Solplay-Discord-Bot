// src/commands.ts
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { dealCards, initializeGame, displayCurrentCard } from './game'; // Import your game logic
import { Player } from './player'; // Import your player types
import { GameState} from './gameState'; // Import your game logic
import { CardColor} from './card'; // Import your game logic

/**
 * Handles the /uno command to start a game of Uno.
 * @param interaction The interaction object from Discord.
 */
export async function handleUnoCommand(interaction: any) {
    const player1 = interaction.options.getUser('player1');
    const player2 = interaction.options.getUser('player2');

    if (!player1 || !player2) {
        return interaction.reply('Please mention two players to start the game.');
    }

    const players: Player[] = [
        {
            id: player1.id,
            name: player1.username,
            cards: [],
        },
        {
            id: player2.id,
            name: player2.username,
            cards: [],
        },
    ];

    const gameState: GameState = initializeGame(players);
    dealCards(gameState, 7); // Deal 7 cards to each player

    const textChannel = interaction.channel as TextChannel;
    await interaction.reply(`Game started! Players: ${players.map(p => p.name).join(', ')}`);
    displayCurrentCard(textChannel, gameState);
    await displayCardButtons(textChannel, gameState, players[gameState.currentPlayerIndex]);
}

/**
 * Displays all Uno cards as buttons for the current player.
 * @param channel The text channel to send the buttons to.
 * @param gameState The current game state.
 * @param currentPlayer The player whose turn it is.
 */
export async function displayCardButtons(channel: TextChannel, gameState: GameState, currentPlayer: Player) {
    const row = new ActionRowBuilder<ButtonBuilder>();

    // Get the current card type
    const currentCard = gameState.currentCard;

    // Add number cards (0-9)
    for (const color of Object.values(CardColor)) {
        for (let number = 0; number <= 9; number++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`play_${color}_${number}`)
                    .setLabel(`${color} ${number}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Add action cards (Skip, Reverse, Draw Two)
        for (const action of ['Skip', 'Reverse', 'Draw Two']) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`play_${color}_${action}`)
                    .setLabel(`${color} ${action}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }
    }

    // Add wild cards
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('play_wild')
            .setLabel('Wild Card')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('play_wild_draw4')
            .setLabel('Wild Draw 4')
            .setStyle(ButtonStyle.Primary)
    );

    // Add draw card button
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('draw_card')
            .setLabel('Draw Card')
            .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ content: `${currentPlayer.name}, choose a card to play:`, components: [row] });
}