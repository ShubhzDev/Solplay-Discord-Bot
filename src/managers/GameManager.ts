import { Card, createDeck, shuffleDeck } from '../card';
import { GameState } from '../gameState';
import { Player } from '../player';

export class GameManager {
  private gameStates: Map<string, GameState>;

  constructor() {
    this.gameStates = new Map();
  }

  createGame(gameId: string): void {
    const deck = shuffleDeck(createDeck());
    const initialCard = deck.pop();

    if (initialCard) {
      this.gameStates.set(gameId, {
        currentCard: initialCard,
        players: [],
        currentPlayerIndex: 0,
        direction: 1,
        deck,
        isActive: false,
      });
    }
  }

  addPlayer(playerId: string, playerName: string, gameId: string): void {
    const gameState = this.getGameState(gameId);
    if (gameState && !gameState.players.find(p => p.id === playerId)) {
      const player: Player = {
        id: playerId,
        name: playerName,
        cards: [],
        interaction: null,
      };
      gameState.players.push(player);
    }
  }

  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  deleteGame(gameId: string): void {
    this.gameStates.delete(gameId);
  }
}