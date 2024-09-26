// src/gameLogic.ts
import { Card, CardType, CardColor, NumberCardInfo, ActionCardInfo, WildCardInfo, CardNumber, createDeck, shuffleDeck } from './card'; // Import your card types
import { Player } from './player'; // Import your player types
import { GameState } from './gameState'; // Import your game state type
import { TextChannel } from 'discord.js';

/**
 * Initializes the game state with the given players.
 * @param players The players participating in the game.
 * @returns The initialized game state.
 */
export function initializeGame(players: Player[]): GameState {
    const initialCard: Card = {
        type: CardType.NumberCard,
        info: {
            number: CardNumber.Zero,
            color: CardColor.Red,
        },
        id: CardColor.Red+CardNumber.Zero,
    };

    // Create and shuffle the deck
    const deck = shuffleDeck(createDeck());

    return {
        currentCard: initialCard,
        players: players,
        currentPlayerIndex: 0,
        direction: 1, // Start with clockwise direction
        deck: deck, // Include the deck in the game state
    };
}

/**
 * Deals cards to players.
 * @param gameState The current game state.
 * @param numberOfCards The number of cards to deal to each player.
 */
export function dealCards(gameState: GameState, numberOfCards: number) {
    for (const player of gameState.players) {
        for (let i = 0; i < numberOfCards; i++) {
            const card = gameState.deck.pop(); // Draw a card from the deck
            if (card) {
                player.cards.push(card);
            } else {
                console.warn('No more cards left in the deck to deal.');
                break; // Exit if there are no cards left
            }
        }
    }
}

/**
 * Displays the current card in the channel.
 * @param channel The text channel to send the current card to.
 * @param gameState The current game state.
 */
export function displayCurrentCard(channel: TextChannel, gameState: GameState) {
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