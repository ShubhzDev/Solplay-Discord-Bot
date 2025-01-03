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
    const initialCard: Card | undefined = deck.pop();
    // console.log("game id outside", gameId);

    if (initialCard) {
      // console.log("game id inside", gameId);

      if (!this.gameStates.has(gameId)) {
        // console.log("this.gameStates.has");

        this.gameStates.set(gameId, {
          currentCard: initialCard,
          players: [],
          currentPlayerIndex: 0,
          direction: 1,
          deck: deck,
          isActive:false,
        });
      }
    }
  }

  addPlayer(playerId: string, playerName: string, gameId: string): void {
    const gameState: GameState | undefined = this.getGameState(gameId);
    const player: Player = {
      id: playerId,
      name: playerName,
      cards: [],
      interaction:null,
    };
    if (gameState) {
      gameState.players.push(player);
      // console.log("Pushed player", player.name);
    }
  }

  getGameState(gameId: string): GameState | undefined {
    // console.log("game id", gameId);
    return this.gameStates.get(gameId);
  }
}
