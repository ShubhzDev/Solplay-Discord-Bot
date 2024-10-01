// src/gameState.ts

import { TextChannel } from "discord.js";
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
import { gameState } from "./commands1";
import { displayCurrentCard } from "./game";
import { Player } from "./player";

export interface GameState {
  currentCard: Card;
  players: Player[];
  currentPlayerIndex: number;
  direction: number; // 1 for clockwise, -1 for counter-clockwise
  deck: Card[]; // Add the deck to the game state
  isActive : boolean,
}

import {manager} from "./commands1";

// Function to initialize the game state
// export function initializeGame(players: Player[]): GameState {
//   const initialCard: Card = {
//     type: CardType.NumberCard,
//     info: {
//       number: CardNumber.Zero,
//       color: CardColor.Red
//     },
//     id: CardColor.Red + CardNumber.Zero,
//   };

//   const deck = shuffleDeck(createDeck()); // Create and shuffle the deck

//   return {
//     currentCard: initialCard,
//     players: players,
//     currentPlayerIndex: 0,
//     direction: 1,
//     deck: deck, // Initialize the deck in the game state
//   };
// }

export function startGame(interaction: any, gameState: GameState) {
  // initializeGame(gameState.players, gameState);
  dealCards(gameState, 7);
  const textChannel = interaction.channel as TextChannel;
  displayCurrentCard(textChannel, gameState);
}

export function initializeGame(players: Player[], gameState: GameState) {
  const deck = shuffleDeck(createDeck()); // Create and shuffle the deck

  const initialCard: Card | undefined = gameState.deck.pop();
  dealCards(gameState, 7); // Deal 7 cards to each player

  if (initialCard) {
    (gameState.currentCard = initialCard), (gameState.players = players);
    gameState.currentPlayerIndex = 0;
  }
}

//created player
function createPlayer(playerId: string, playerName: string): Player {
  const player: Player = {
    id: playerId,
    name: playerName,
    cards: [],
  };
  return player;
}

//added player
export function AddPlayer(
  playerId: string,
  playerName: string,
  gameId: string
) {
  manager.addPlayer(playerId, playerName, gameId);
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
  for (const player of gameState.players){
    console.log("Dealing Cards to Player : ",player.name);
    for (let i = 0; i < numberOfCards; i++) {
      const card = gameState.deck.pop(); // Get the last card from the deck
      if (card) {
        player.cards.push(card); // Add the card to the player's hand
      }
    }
  }
}
