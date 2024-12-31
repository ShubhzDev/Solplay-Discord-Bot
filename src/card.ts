// card.ts
import { Colors } from "discord.js";

export interface Card {
  type: CardType;
  info: CardInfo;
  id: string;
}

export enum CardType {
  NumberCard = "NumberCard",
  ActionCard = "ActionCard",
  WildCard = "WildCard",
}

export type CardInfo = NumberCardInfo | ActionCardInfo | WildCardInfo;

export interface NumberCardInfo {
  number: CardNumber;
  color: CardColor;
}

export interface ActionCardInfo {
  action: ActionType;
  color: CardColor;
}

export interface WildCardInfo {
  color: CardColor;
  wildType: WildType;
}

export enum CardNumber {
  Zero = "0",
  One = "1",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
}

export enum CardColor {
  Red = "Red",
  Blue = "Blue",
  Green = "Green",
  Yellow = "Yellow",
  Black = "Black",
}

export enum ActionType {
  Skip = "Skip",
  Reverse = "Reverse",
  PlusTwo = "PlusTwo",
}

export enum WildType {
  ColorChange = "ColorChange",
  PlusFourAndColorChange = "PlusFourAndColorChange",
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let index: number = 0;

  // Add number cards (0-9)
  Object.values(CardColor).forEach(color => {
    if (color === CardColor.Black) return;

    // Add one Zero card
    deck.push({
      type: CardType.NumberCard,
      info: { number: CardNumber.Zero, color },
      id: `${color}_${CardNumber.Zero}_${index++}`,
    });

    // Add two of each number card (1-9)
    Object.values(CardNumber).forEach(number => {
      if (number === CardNumber.Zero) return;
      for (let i = 0; i < 2; i++) {
        deck.push({
          type: CardType.NumberCard,
          info: { number, color },
          id: `${color}_${number}_${index++}`,
        });
      }
    });

    // Add action cards
    Object.values(ActionType).forEach(action => {
      for (let i = 0; i < 2; i++) {
        deck.push({
          type: CardType.ActionCard,
          info: { action, color },
          id: `${color}_${action}_${index++}`,
        });
      }
    });
  });

  // Add wild cards
  Object.values(WildType).forEach(wildType => {
    for (let i = 0; i < 4; i++) {
      deck.push({
        type: CardType.WildCard,
        info: { color: CardColor.Black, wildType },
        id: `${CardColor.Black}_${wildType}_${index++}`,
      });
    }
  });

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const baseUrl = "https://raw.githubusercontent.com/WilliamWelsh/UNO/main/images/";

export function getCardImg(card: Card): string {
  if (!card) return "";

  switch (card.type) {
    case CardType.NumberCard: {
      const info = card.info as NumberCardInfo;
      return `${info.color}${info.number}.png`;
    }
    case CardType.ActionCard: {
      const info = card.info as ActionCardInfo;
      return `${info.color}${info.action}.png`;
    }
    case CardType.WildCard: {
      const info = card.info as WildCardInfo;
      return info.wildType === WildType.ColorChange ? 
        "wild-card-color.png" : 
        "wild-draw-four-card.png";
    }
    default:
      return "";
  }
}