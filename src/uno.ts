// uno.ts

import { Card ,CardType,ActionType,CardColor} from './card';
import { GameState, initializeGame, updateCurrentCard, nextPlayer } from './gameState';
import { Player } from './player';

// Example usage of the game logic
// const players: Player[] = [
//     { id: '1', name: 'Alice', cards: [] },
//     { id: '2', name: 'Bob', cards: [] },
// ];

// let gameState = initializeGame(players);
// console.log("Initial Game State:", gameState);

// Update the current card and move to the next player
// const newCard: Card = {
//     type: CardType.ActionCard,
//     info: {
//         action: ActionType.Skip,
//         color: CardColor.Red,
//     },
// };
// updateCurrentCard(gameState, newCard);
// nextPlayer(gameState);
// console.log("Updated Game State:", gameState);