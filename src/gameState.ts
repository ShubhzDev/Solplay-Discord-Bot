// gameState.ts

import {
  Card,
  createDeck,
  shuffleDeck,
  CardType,
  CardNumber,
  CardColor,
} from "./card";
import { Player } from "./player";

export interface GameState {
  currentCard: Card;
  players: Player[];
  currentPlayerIndex: number;
  direction: number; // 1 for clockwise, -1 for counter-clockwise
}

export function initializeGame(players: Player[]): GameState {
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
    direction: 1,
  };
}

export function updateCurrentCard(gameState: GameState, newCard: Card): void {
  gameState.currentCard = newCard;
}

export function nextPlayer(gameState: GameState): void {
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex +
      gameState.direction +
      gameState.players.length) %
    gameState.players.length;
}

// Function to deal cards to players
export function dealCards(gameState: GameState, numberOfCards: number): void {
  const deck = shuffleDeck(createDeck());

  // Deal cards to each player
  for (const player of gameState.players) {
    for (let i = 0; i < numberOfCards; i++) {
      const card = deck.pop(); // Get the last card from the deck
      if (card) {
        player.cards.push(card); // Add the card to the player's hand
      }
    }
  }

  // Set the remaining deck in the game state if needed
  // gameState.deck = deck; // Uncomment if you want to keep track of the deck
}
