import { Card, createDeck, shuffleDeck } from "./card";
import { gameState } from "./commands1";
import { AddPlayer, GameState } from "./gameState";
import { Player } from "./player";

export class GameManager {
  private gameStates: Map<string, GameState>;

  constructor() {
    this.gameStates = new Map();
  }

  createGame(gameId: string): void {
    const deck = shuffleDeck(createDeck()); // Create and shuffle the deck
    const initialCard: Card | undefined = gameState.deck.pop();
    if (initialCard) {
      if (!this.gameStates.has(gameId)) {
        this.gameStates.set(gameId, {
          currentCard: initialCard,
          players: [],
          currentPlayerIndex: 0,
          direction: 0,
          deck: deck,
        });
      }
    }
  }

  addPlayer(playerId: string, playerName: string, gameId: string): void {
     const gameState : GameState | undefined = this.getGameState(gameId);
     const player : Player = {
      id: playerId,
      name: playerName,
      cards: [],
     }
     if(gameState)
       gameState.players.push();
  }

  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }
}
