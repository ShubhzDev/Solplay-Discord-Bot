// gameState.ts
import { Card, CardType, CardColor, NumberCardInfo, ActionCardInfo, shuffleDeck } from './card';
import { Player } from './player';

export interface GameState {
  currentCard: Card;
  players: Player[];
  currentPlayerIndex: number;
  direction: number;
  deck: Card[];
  isActive: boolean;
  lastPlayedCard?: Card;
}

export function startGame(gameState: GameState): void {
  if (!gameState.isActive && gameState.players.length >= 2) {
    gameState.isActive = true;
    dealCards(gameState, 7);
    
    // Set initial card that's not a wild or action card
    do {
      const card = gameState.deck.pop();
      if (card && card.type === CardType.NumberCard) {
        gameState.currentCard = card;
        break;
      } else if (card) {
        gameState.deck.unshift(card);
      }
    } while (gameState.deck.length > 0);
  }
}

export function dealCards(gameState: GameState, numberOfCards: number): void {
  gameState.players.forEach(player => {
    for (let i = 0; i < numberOfCards; i++) {
      const card = gameState.deck.pop();
      if (card) {
        player.cards.push(card);
      }
    }
  });
}

export function nextPlayer(gameState: GameState): void {
  const playerCount = gameState.players.length;
  gameState.currentPlayerIndex = (gameState.currentPlayerIndex + gameState.direction + playerCount) % playerCount;
}

export function isValidPlay(currentCard: Card, playedCard: Card): boolean {
  if (playedCard.type === CardType.WildCard) return true;

  if (currentCard.type === CardType.NumberCard && playedCard.type === CardType.NumberCard) {
    const currentInfo = currentCard.info as NumberCardInfo;
    const playedInfo = playedCard.info as NumberCardInfo;
    return currentInfo.color === playedInfo.color || currentInfo.number === playedInfo.number;
  }

  if (currentCard.type === CardType.ActionCard && playedCard.type === CardType.ActionCard) {
    const currentInfo = currentCard.info as ActionCardInfo;
    const playedInfo = playedCard.info as ActionCardInfo;
    return currentInfo.color === playedInfo.color || currentInfo.action === playedInfo.action;
  }

  if (currentCard.type === CardType.NumberCard && playedCard.type === CardType.ActionCard) {
    return (currentCard.info as NumberCardInfo).color === (playedCard.info as ActionCardInfo).color;
  }

  if (currentCard.type === CardType.ActionCard && playedCard.type === CardType.NumberCard) {
    return (currentCard.info as ActionCardInfo).color === (playedCard.info as NumberCardInfo).color;
  }

  return false;
}

export function showValidCards(gameState: GameState, cards: Card[]): Card[] {
  return cards.filter(card => isValidPlay(gameState.currentCard, card));
}

export function checkWinner(player: Player): boolean {
  return player.cards.length === 0;
}

export function reshuffleDeckIfNeeded(gameState: GameState): void {
  if (gameState.deck.length < 4) {
    const lastCard = gameState.currentCard;
    const newDeck = shuffleDeck([...gameState.deck, gameState.currentCard]);
    gameState.deck = newDeck;
    gameState.currentCard = lastCard;
  }
}