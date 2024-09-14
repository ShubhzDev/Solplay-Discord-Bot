// bot.ts
import { Client, GatewayIntentBits, Events, Message, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { dealCards, GameState } from './gameState'; // Import your game logic
import { Card, CardType, CardNumber, CardColor, NumberCardInfo, ActionCardInfo, WildCardInfo } from './card'; // Import your card types
import { Player } from './player'; // Import your player types
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
    ],
});

const activeGames: Map<string, GameState> = new Map(); // Store active games by channel ID

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on(Events.MessageCreate, async (message: Message) => {
    if (message.content.startsWith('!startgame')) {
        const mentions = message.mentions.users;
        if (mentions.size < 2 || mentions.size > 4) {
            return message.reply('You must tag between 2 to 4 players to start a game.');
        }

        const players: Player[] = mentions.map(user => ({
            id: user.id,
            name: user.username,
            cards: [],
        }));

        const gameState: GameState = initializeGame(players);
        dealCards(gameState, 7); // Deal 7 cards to each player
        activeGames.set(message.channelId, gameState);

        // Use type assertion to specify the channel type
        const textChannel = message.channel as TextChannel;
        textChannel.send(`Game started! Players: ${players.map(p => p.name).join(', ')}`);
        displayCurrentCard(textChannel, gameState);
        await displayActionButtons(textChannel);
    }

    if (message.content.startsWith('!turn')) {
        const gameState = activeGames.get(message.channelId);
        if (!gameState) {
            return message.reply('No active game in this channel.');
        }

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (currentPlayer.id !== message.author.id) {
            return message.reply('It is not your turn!');
        }

        // Display the player's hand
        const playerHand = currentPlayer.cards.map((card, index) => {
            return `${index + 1}: ${card.info.color} ${card.type === CardType.NumberCard ? card.info.number : card.info.action}`;
        }).join('\n');

        // Ask the player to choose a card to play or draw a card
        await message.reply(`Your turn! Here are your cards:\n${playerHand}\nType the number of the card you want to play, or type 'draw' to draw a card.`);

        // Wait for the player's response
        const filter = (response: Message) => {
            return response.author.id === currentPlayer.id && (response.content.startsWith('draw') || !isNaN(parseInt(response.content)));
        };

        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });

        const response = collected.first();
        if (!response) return message.reply('You did not respond in time!');

        if (response.content.startsWith('draw')) {
            // Logic for drawing a card
            const drawnCard = gameState.deck.pop(); // Assuming you have a deck in your game state
            if (drawnCard) {
                currentPlayer.cards.push(drawnCard);
                await message.reply(`You drew a card: ${drawnCard.info.color} ${drawnCard.type === CardType.NumberCard ? drawnCard.info.number : drawnCard.info.action}`);
            } else {
                await message.reply('No cards left in the deck to draw!');
            }
        } else {
            const cardIndex = parseInt(response.content) - 1;
            if (cardIndex < 0 || cardIndex >= currentPlayer.cards.length) {
                return message.reply('Invalid card selection!');
            }

            const selectedCard = currentPlayer.cards[cardIndex];
            if (!isValidMove(selectedCard, gameState.currentCard)) {
                return message.reply('You cannot play that card!');
            }

            // Update game state
            gameState.currentCard = selectedCard; // Set the played card as the current card
            currentPlayer.cards.splice(cardIndex, 1); // Remove the card from the player's hand

            await message.reply(`You played: ${selectedCard.info.color} ${selectedCard.type === CardType.NumberCard ? selectedCard.info.number : selectedCard.info.action}`);
        }

        // Move to the next player
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

        // Notify all players about the current card
        displayCurrentCard(message.channel as TextChannel, gameState);
        await displayActionButtons(message.channel as TextChannel);
    }
});

// Display the current card
function displayCurrentCard(channel: TextChannel, gameState: GameState) {
    const currentCard = gameState.currentCard;

    let cardDescription: string;

    // Type narrowing to determine the type of currentCard.info
    if (currentCard.type === CardType.NumberCard) {
        const numberInfo = currentCard.info as NumberCardInfo; // Narrow to NumberCardInfo
        cardDescription = `${numberInfo.color} ${numberInfo.number}`;
    } else if (currentCard.type === CardType.ActionCard) {
        const actionInfo = currentCard.info as ActionCardInfo; // Narrow to ActionCardInfo
        cardDescription = `${actionInfo.color} ${actionInfo.action}`;
    } else {
        const wildInfo = currentCard.info as WildCardInfo; // Narrow to WildCardInfo
        cardDescription = `Wild Card: ${wildInfo.wildType}`;
    }

    channel.send(`Current Card: ${cardDescription}`);
}

// Display action buttons for the player
async function displayActionButtons(channel: TextChannel) {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('play_card')
                .setLabel('Play Card')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('draw_card')
                .setLabel('Draw Card')
                .setStyle(ButtonStyle.Secondary)
        );

    await channel.send({ content: 'Choose an action:', components: [row] });
}

// Handle button interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const gameState = activeGames.get(interaction.channelId);
    if (!gameState) {
        return interaction.reply({ content: 'No active game in this channel.', ephemeral: true });
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== interaction.user.id) {
        return interaction.reply({ content: 'It is not your turn!', ephemeral: true });
    }

    switch (interaction.customId) {
        case 'play_card':
            // Logic for playing a card
            await interaction.reply({ content: 'You chose to play a card.', ephemeral: true });
            // Implement logic to let the player choose a card to play
            break;
        case 'draw_card':
            // Logic for drawing a card
            await interaction.reply({ content: 'You drew a card.', ephemeral: true });
            // Implement logic to add a card to the player's hand
            break;
    }

    // Move to the next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    displayCurrentCard(interaction.channel as TextChannel, gameState);
    await displayActionButtons(interaction.channel as TextChannel);
});

// Initialize the game state
function initializeGame(players: Player[]): GameState {
    const initialCard: Card = {
        type: CardType.NumberCard,
        info: {
            number: CardNumber.Zero,
            color: CardColor.Red,
        },
    };

    return {
        currentCard: initialCard,
        players: players,
        currentPlayerIndex: 0,
        direction: 1, // Start with clockwise direction
    };
}

// Function to validate if a move is valid according to Uno rules
function isValidMove(cardToPlay: Card, currentCard: Card): boolean {
    // Check if the card color matches or the number/action matches or if it's a wild card
    return (
        cardToPlay.info.color === currentCard.info.color ||
        cardToPlay.info.number === currentCard.info.number ||
        (cardToPlay.type === CardType.ActionCard && cardToPlay.info.action === currentCard.info.action) ||
        cardToPlay.type === CardType.WildCard
    );
}

client.login(process.env.Discord_Bot);