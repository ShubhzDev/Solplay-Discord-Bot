// src/commands.ts
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { dealCards, initializeGame, displayCurrentCard } from './game'; // Import your game logic
import { Player } from './player'; // Import your player types
import { GameState,showValidCards} from './gameState'; // Import your game logic
import { CardColor, CardType,NumberCardInfo,ActionCardInfo } from './card'; // Ensure CardType is imported

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
 * Displays card buttons for the current player based on valid moves.
 * @param channel The text channel to send the buttons to.
 * @param gameState The current game state.
 * @param currentPlayer The player whose turn it is.
 */
export async function displayCardButtons(channel: TextChannel, gameState: GameState, currentPlayer: Player) {
    const rows: ActionRowBuilder<ButtonBuilder>[] = []; // Array to hold multiple rows
    let currentRow = new ActionRowBuilder<ButtonBuilder>(); // Start with a new row

    // Get valid cards for the current player
    const validCards = showValidCards(gameState, currentPlayer.cards);

    // Helper function to add card buttons
    const addCardButton = (id: string, label: string, isEnabled: boolean) => {
        currentRow.addComponents(
            new ButtonBuilder()
                .setCustomId(id)
                .setLabel(label)
                .setStyle(isEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(!isEnabled)
        );

        // If we reach 5 buttons in the current row, push it and create a new one
        if (currentRow.components.length >= 5) {
            rows.push(currentRow);
            currentRow = new ActionRowBuilder<ButtonBuilder>(); // Create a new row
        }
    };

    // Only show the current player's cards
    for (const card of currentPlayer.cards) {
        let cardId: string;
        let label: string;

        if (card.type === CardType.NumberCard) {
            const numberInfo = card.info as NumberCardInfo; // Type assertion
            cardId = `play_${numberInfo.color}_${numberInfo.number}`;
            label = `${numberInfo.color} ${numberInfo.number}`;
        } else if (card.type === CardType.ActionCard) {
            const actionInfo = card.info as ActionCardInfo; // Type assertion
            cardId = `play_${actionInfo.color}_${actionInfo.action}`;
            label = `${actionInfo.color} ${actionInfo.action}`;
        } else {
            continue; // Skip if it's not a valid card type
        }

        const isEnabled = validCards.includes(card); // Check if this card is valid to play

        addCardButton(cardId, label, isEnabled);
    }

    // Push the last row if it has any buttons
    if (currentRow.components.length > 0) {
        rows.push(currentRow);
    }

    // Add draw card button (always enabled), in a new row if needed
    const drawCardRow = new ActionRowBuilder<ButtonBuilder>();
    drawCardRow.addComponents(
        new ButtonBuilder()
            .setCustomId('draw_card')
            .setLabel('Draw Card')
            .setStyle(ButtonStyle.Secondary) // You can keep this as secondary or primary based on your design
    );
    rows.push(drawCardRow); // Add draw card button row

    await channel.send({ content: `${currentPlayer.name}, choose a card to play:`, components: rows });
}