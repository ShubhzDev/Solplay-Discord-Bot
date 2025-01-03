// card.ts
import { Colors } from "discord.js";
import internal from "stream";

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
  // number?: CardNumber;
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

// Function to create a complete deck of Uno cards
export function createDeck(): Card[] {
  const deck: Card[] = [];
  let index: number = 0;
  // Add number cards (0-9)
  for (const color in CardColor) {
    if (color == CardColor.Black) {
      continue;
    }

    // Ensure we are only dealing with the enum's string values
    if (isNaN(Number(color))) {
      // Add one Zero card
      deck.push({
        type: CardType.NumberCard,
        info: {
          number: CardNumber.Zero,
          color: CardColor[color as keyof typeof CardColor],
        },
        id: color + "_" + CardNumber.Zero + "_" + index.toString(),
      });
      index++;

      // Add two of each number card (1-9)
      for (const number of [
        CardNumber.One,
        CardNumber.Two,
        CardNumber.Three,
        CardNumber.Four,
        CardNumber.Five,
        CardNumber.Six,
        CardNumber.Seven,
        CardNumber.Eight,
        CardNumber.Nine,
      ]) {
        deck.push({
          type: CardType.NumberCard,
          info: { number, color: CardColor[color as keyof typeof CardColor] },
          id: color + "_" + number + "_" + index.toString(),
        });
        index++;
        deck.push({
          type: CardType.NumberCard,
          info: { number, color: CardColor[color as keyof typeof CardColor] },
          id: color + "_" + number + "_" + index.toString(),
        });
        index++;
      }
    }
  }

  // Add action cards (Skip, Reverse, Plus Two)
  for (const color in CardColor) {

    if (color == CardColor.Black) {
        continue;
    }

    // Ensure we are only dealing with the enum's string values
    if (isNaN(Number(color))) {
      for (const action in ActionType) {
        // Ensure we are only dealing with the enum's string values
        if (isNaN(Number(action))) {
          // Add two of each action card
          deck.push({
            type: CardType.ActionCard,
            info: {
              action: ActionType[action as keyof typeof ActionType],
              color: CardColor[color as keyof typeof CardColor],
            },
            id: color + "_" + action + "_" + index.toString(),
          });
          index++;
          deck.push({
            type: CardType.ActionCard,
            info: {
              action: ActionType[action as keyof typeof ActionType],
              color: CardColor[color as keyof typeof CardColor],
            },
            id: color + "_" + action + "_" + index.toString(),
          });
          index++;
        }
      }
    }
  }

  // Add wild cards (Color Change and Plus Four and Color Change)
  for (let i = 0; i < 4; i++) {
    deck.push({
      type: CardType.WildCard,
      info: { color: CardColor.Black, wildType: WildType.ColorChange },
      id: CardColor.Black + "_" + WildType.ColorChange + "_" + index.toString(),
    });
    index++;
    deck.push({
      type: CardType.WildCard,
      info: {
        color: CardColor.Black,
        wildType: WildType.PlusFourAndColorChange,
      },
      id:
        CardColor.Black +
        "_" +
        WildType.PlusFourAndColorChange +
        "_" +
        index.toString(),
    });
    index++;
  }

  return deck;
}

// Function to shuffle the deck
export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
  }
  return deck;
}

let cardName: string = "";
const baseUrl: string = "";
export function getCardImg(card: Card) {
  if (card.type === CardType.NumberCard) {
    const cardInfo = card.info as NumberCardInfo;
    cardName = cardInfo.color + cardInfo.number;
    return baseUrl + cardName + ".png";
  } else if (card.type === CardType.ActionCard) {
    const cardInfo = card.info as ActionCardInfo;
    cardName = cardInfo.color + cardInfo.action;
    return baseUrl + cardName + ".png";
  } else if (card.type === CardType.WildCard) {
    const cardInfo = card.info as WildCardInfo;
    console.log("//////////",cardInfo.wildType);
    if(cardInfo.wildType === "wi; || cardInfo.wildType === "PlusFourAndColorChange"){
      cardName = cardInfo.color + "Wild";
    }
    else{
      cardName = cardInfo.color + cardInfo.wildType;
    }
    return baseUrl + cardName+ ".png";
  }
}
