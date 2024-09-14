// bot.ts
import { Client, GatewayIntentBits, Events, Message } from 'discord.js';
import { createDeck, dealCards, GameState, Player } from './gameState'; // Import your game logic
import { Card,CardType,CardNumber,CardColor } from './card'; // Import your card types

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
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

        message.channel.send(`Game started! Players: ${players.map(p => p.name).join(', ')}`);
        // Notify players of their cards or next actions here
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

        // Logic for the player's turn (play a card, draw a card, etc.)
        // Update game state and notify players
    }
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

client.login('YOUR_BOT_TOKEN');