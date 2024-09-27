// src/gameState.ts

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
  deck: Card[]; // Add the deck to the game state
}

// Function to initialize the game state
export function initializeGame(players: Player[]): GameState {
  const initialCard: Card = {
    type: CardType.NumberCard,
    info: {
      number: CardNumber.Zero,
      color: CardColor.Red
    },
    id: CardColor.Red + CardNumber.Zero,
  };

  const deck = shuffleDeck(createDeck()); // Create and shuffle the deck

  return {
    currentCard: initialCard,
    players: players,
    currentPlayerIndex: 0,
    direction: 1,
    deck: deck, // Initialize the deck in the game state
  };
}

//created player
function createPlayer(id : string) : Player{
  const player : Player = {
    id : id,
    name : id,
    cards : [],
  };
  return player;
}

//added player
function AddPlayer(id:string,gameState:GameState){
  const player : Player = createPlayer(id);
  gameState.players.push(player);
}

// Function to update the current card
export function updateCurrentCard(gameState: GameState, newCard: Card): void {
  gameState.currentCard = newCard;
}

// Function to move to the next player
export function nextPlayer(gameState: GameState): void {
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex +
      gameState.direction +
      gameState.players.length) %
    gameState.players.length;
}

// Function to show valid cards that can be played
export function showValidCards(gameState: GameState, cards: Card[]): Card[] {
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

// Function to deal cards to players
export function dealCards(gameState: GameState, numberOfCards: number): void {
  // Deal cards to each player
  for (const player of gameState.players) {
    for (let i = 0; i < numberOfCards; i++) {
      const card = gameState.deck.pop(); // Get the last card from the deck
      if (card) {
        player.cards.push(card); // Add the card to the player's hand
      }
    }
  }
}

