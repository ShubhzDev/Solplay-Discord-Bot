// player.ts
import { Card } from './card';
import { CommandInteraction } from 'discord.js';

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  interaction: CommandInteraction | null;
}

export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    cards: [],
    interaction: null
  };
}