// gameState.ts

import {
  Card,
  createDeck,
  shuffleDeck,
  CardType,
  CardNumber,
  CardColor,
  ActionCardInfo,
  NumberCardInfo,
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

export function showValidCards(gameState: GameState, cards: Card[]) : Card[]{
  let enabledCard: Card[] = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (card.type === CardType.NumberCard) {
      if (gameState.currentCard.type === CardType.NumberCard) {
        const currentCardInfo = gameState.currentCard.info as NumberCardInfo; // Type assertion
        const cardInfo = card.info as NumberCardInfo; // Type assertion

        if (cardInfo.color === currentCardInfo.color) {
          enabledCard.push(card);
        }

        if (cardInfo.number === currentCardInfo.number) {
          enabledCard.push(card);
        }
      }
    } else if (gameState.currentCard.type === CardType.ActionCard) {
      const currentCardInfo = gameState.currentCard.info as ActionCardInfo; // Type assertion
      const cardInfo = card.info as ActionCardInfo; // Type assertion

      if (
        card.type === CardType.ActionCard &&
        cardInfo.action === currentCardInfo.action
      ) {
        enabledCard.push(card);
      }
    }

    if (card.type === CardType.WildCard) {
      enabledCard.push(card);
    }
  }

  return enabledCard;
}

export let deck: Card[];

// Function to deal cards to players
export function dealCards(gameState: GameState, numberOfCards: number): void {
  deck = shuffleDeck(createDeck());

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
