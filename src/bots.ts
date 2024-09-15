// bot.ts
import { Client, GatewayIntentBits, Events, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes } from 'discord.js';
import { dealCards, GameState } from './gameState'; // Import your game logic
import { Card, CardType, CardNumber, CardColor, NumberCardInfo, ActionCardInfo, WildCardInfo } from './card'; // Import your card types
import { Player } from './player'; // Import your player types
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const activeGames: Map<string, GameState> = new Map(); // Store active games by channel ID

// Register the slash command
const commands = [
    {
        name: 'uno',
        description: 'Start a game of Uno',
        options: [
            {
                name: 'player1',
                description: 'First player to join the game',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'player2',
                description: 'Second player to join the game',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '9' }).setToken(process.env.Discord_Bot);

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}`);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(client.user?.id), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'uno') {
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

        // Use type assertion to specify the channel type
        const textChannel = interaction.channel as TextChannel;
        await interaction.reply(`Game started! Players: ${players.map(p => p.name).join(', ')}`);
        displayCurrentCard(textChannel, gameState);
        await displayCardButtons(textChannel, gameState, players[gameState.currentPlayerIndex]);
    }
});

// Function to display all Uno cards as buttons
async function displayCardButtons(channel: TextChannel, gameState: GameState, currentPlayer: Player) {
    const row = new ActionRowBuilder<ButtonBuilder>();

    // Get the current card type
    const currentCard = gameState.currentCard;
    const currentCardType = currentCard.type;

    // Add number cards (0-9)
    if (currentCardType === CardType.NumberCard || currentCardType === CardType.ActionCard) {
        const currentCardInfo = currentCard.info as NumberCardInfo | ActionCardInfo;
        const currentColor = currentCardInfo.color;

        for (const color of Object.values(CardColor)) {
            if (color === currentColor || color === CardColor.Wild) {
                for (let number = CardNumber.Zero; number <= CardNumber.Nine; number++) {
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`play_${color}_${number}`)
                            .setLabel(`${color} ${number}`)
                            .setStyle(ButtonStyle.Primary)
                    );
                }
            }
        }
    }

    // Add action cards (Skip, Reverse, Draw Two)
    if (currentCardType === CardType.ActionCard) {
        const currentActionInfo = currentCard.info as ActionCardInfo;
        const currentAction = currentActionInfo.action;

        for (const action of ['Skip', 'Reverse', 'Draw Two']) {
            if (action === currentAction || action === 'Wild Draw 4') {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`play_${currentActionInfo.color}_${action}`)
                        .setLabel(`${currentActionInfo.color} ${action}`)
                        .setStyle(ButtonStyle.Primary)
                );
            }
        }
    }

    // Add wild cards
    if (currentCardType === CardType.WildCard) {
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
    }

    // Add draw card button
    row.addComponents(
        new ButtonBuilder()
            .setCustomId('draw_card')
            .setLabel('Draw Card')
            .setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ content: `${currentPlayer.name}, choose a card to play:`, components: [row] });
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

    const [action, color, value] = interaction.customId.split('_');

    if (action === 'play') {
        // Logic for playing a card
        await interaction.reply({ content: `You chose to play: ${color} ${value}`, ephemeral: true });
        
        // Implement logic to update game state with the played card
        // For example, check if the card is valid and update the game state accordingly
    } else if (action === 'draw_card') {
        // Logic for drawing a card
        await interaction.reply({ content: `You chose to draw a card.`, ephemeral: true });
        
        // Implement logic to draw a card and update the game state
    }

    // Move to the next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % players.length;
    displayCurrentCard(interaction.channel as TextChannel, gameState);
    await displayCardButtons(interaction.channel as TextChannel, gameState, players[gameState.currentPlayerIndex]);
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

// Function to display the current card
function displayCurrentCard(channel: TextChannel, gameState: GameState) {
    const currentCard = gameState.currentCard;
    let cardDescription: string;

    if (currentCard.type === CardType.NumberCard) {
        const numberInfo = currentCard.info as NumberCardInfo;
        cardDescription = `${numberInfo.color} ${numberInfo.number}`;
    } else if (currentCard.type === CardType.ActionCard) {
        const actionInfo = currentCard.info as ActionCardInfo;
        cardDescription = `${actionInfo.color} ${actionInfo.action}`;
    } else {
        const wildInfo = currentCard.info as WildCardInfo;
        cardDescription = `Wild Card: ${wildInfo.wildType}`;
    }

    channel.send(`Current Card: ${cardDescription}`);
}

client.login(process.env.Discord_Bot);