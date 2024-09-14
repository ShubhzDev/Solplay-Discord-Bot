// player.ts

import { Card } from './card';

export interface Player {
    id: string;
    name: string;
    cards: Card[];
}

// Function to add a card to a player
export function addCardToPlayer(player: Player, card: Card): void {
    player.cards.push(card);
}

// Function to remove a card from a player
export function removeCardFromPlayer(player: Player, card: Card): void {
    player.cards = player.cards.filter(c => c !== card);
}