// utils/gameUtils.ts
import { Card } from '../card';
import { GameState } from '../gameState';
import { Player } from '../player';

export function checkUno(player: Player): boolean {
  return player.cards.length === 1;
}

export function canDrawCard(gameState: GameState): boolean {
  return gameState.deck.length > 0;
}

export function drawCard(gameState: GameState, player: Player): Card | undefined {
  const card = gameState.deck.pop();
  if (card) {
    player.cards.push(card);
  }
  return card;
}