// src/commands.ts
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  TextChannel,
  GuildTextBasedChannel,
} from "discord.js";
import { dealCards, initializeGame, displayCurrentCard } from "./game"; // Import your game logic
import { Player } from "./player"; // Import your player types
import { GameState, showValidCards } from "./gameState"; // Import your game logic
import {
  CardColor,
  CardType,
  NumberCardInfo,
  ActionCardInfo,
  CardNumber,
  WildCardInfo,
} from "./card"; // Ensure CardType is imported

/**
 * Handles the /uno command to start a game of Uno.
 * @param interaction The interaction object from Discord.
 */

export let gameState: GameState;

export async function handleUnoCommand(interaction: any) {
  const player1 = interaction.options.getUser("player1");
  const player2 = interaction.options.getUser("player2");

  if (!player1 || !player2) {
    return interaction.reply("Please mention two players to start the game.");
  }

  const players: Player[] = [
    {
      id: player1.id,
      name: player1.username,
      cards: [],
    },
    {
      id: player2.id,
      name: player2.username,
      cards: [],
    },
  ];

  gameState = initializeGame(players);
  dealCards(gameState, 7); // Deal 7 cards to each player

  const textChannel = interaction.channel as TextChannel;
  await interaction.reply(
    `Game started! Players: ${players.map((p) => p.name).join(", ")}`
  );
  displayCurrentCard(textChannel, gameState);
  await displayCardButtons(
    textChannel,
    gameState,
    players[gameState.currentPlayerIndex]
  );
}

/**
 * Displays card buttons for the current player based on valid moves.
 * @param channel The text channel to send the buttons to.
 * @param gameState The current game state.
 * @param currentPlayer The player whose turn it is.
 */
export async function displayCardButtons(
  channel: TextChannel,
  gameState: GameState,
  currentPlayer: Player
) {
  const rows: ActionRowBuilder<ButtonBuilder>[] = []; // Array to hold multiple rows
  let currentRow = new ActionRowBuilder<ButtonBuilder>(); // Start with a new row

  // Get valid cards for the current player
  const validCards = showValidCards(gameState, currentPlayer.cards);

  // Helper function to add card buttons
  const addCardButton = (id: string, label: string, isEnabled: boolean) => {
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(isEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!isEnabled)
    );

    // If we reach 5 buttons in the current row, push it and create a new one
    if (currentRow.components.length >= 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>(); // Create a new row
    }
  };

  // Only show the current player's cards
  for (const card of currentPlayer.cards) {
    let cardId: string;
    let label: string;

    if (card.type === CardType.NumberCard) {
      const numberInfo = card.info as NumberCardInfo; // Type assertion
      cardId = `play_${numberInfo.color}_${numberInfo.number}`;
      label = `${numberInfo.color} ${numberInfo.number}`;
    } else if (card.type === CardType.ActionCard) {
      const actionInfo = card.info as ActionCardInfo; // Type assertion
      cardId = `play_${actionInfo.color}_${actionInfo.action}`;
      label = `${actionInfo.color} ${actionInfo.action}`;
    } else if (card.type === CardType.WildCard) {
      const wildInfo = card.info as WildCardInfo; // Type assertion
      cardId = `play_${wildInfo.color}_${wildInfo.wildType}`;
      label = `${wildInfo.color} ${wildInfo.wildType}`;
    } else {
      continue; // Skip if it's not a valid card type
    }

    const isEnabled = validCards.includes(card); // Check if this card is valid to play

    addCardButton(cardId, label, isEnabled);
    console.log("cardId : " + cardId);
  }

  // Push the last row if it has any buttons
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  // Add draw card button (always enabled), in a new row if needed
  const drawCardRow = new ActionRowBuilder<ButtonBuilder>();
  drawCardRow.addComponents(
    new ButtonBuilder()
      .setCustomId("draw_card")
      .setLabel("Draw Card")
      .setStyle(ButtonStyle.Secondary) // You can keep this as secondary or primary based on your design
  );
  rows.push(drawCardRow); // Add draw card button row

  const response = await channel.send({
    content: `${currentPlayer.name}, choose a card to play:`,
    components: rows,
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 3_600_000,
  });

  collector.on("collect", async (interaction) => {
    // console.log("Interaction received:", interaction);

    // Check if the interaction is a button
    if (interaction.isButton()) {
      const channel = interaction.channel;

      // Check if the channel is not null and is of type TextChannel
      if (
        channel &&
        (channel instanceof TextChannel)
      ) {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        if (currentPlayer) {
          await handleButtonInteraction(
            interaction,
            currentPlayer,
            gameState,
            channel // Now this is guaranteed to be a TextChannel or GuildTextBasedChannel
          );
        }
      } else {
        console.error("Interaction was not in a text channel.");
        await interaction.reply({
          content:
            "This interaction cannot be processed because it's not in a text channel.",
          ephemeral: true,
        });
      }
    } else {
      console.log("Interaction is not a button.");
    }
  });
}

export async function handleButtonInteraction(
  interaction: any,
  currentPlayer: Player,
  gameState: GameState,
  channel: TextChannel
) {
  // console.log("interaction.customId" + interaction.customId);
  const [action, cardColor, cardValue] = interaction.customId.split("_");

  if (action === "play") {
    const playedCard = currentPlayer.cards.find((card) => {
      if (card.type === CardType.NumberCard) {
        const numberInfo = card.info as NumberCardInfo; // Cast to NumberCardInfo
        return (
          numberInfo.color === cardColor &&
          cardNumberToPrimitive(numberInfo.number) === parseInt(cardValue)
        );
      } else if (card.type === CardType.ActionCard) {
        const actionInfo = card.info as ActionCardInfo; // Cast to ActionCardInfo
        return (
          actionInfo.color === cardColor && actionInfo.action === cardValue
        );
      } else if (card.type === CardType.WildCard) {
        const wildInfo = card.info as WildCardInfo; // Cast to ActionCardInfo
        return wildInfo.color === cardColor && wildInfo.wildType === cardValue;
      }
      return false;
    });

    if (playedCard) {
      //make current card equivalent to player card
      gameState.currentCard = playedCard;
      currentPlayer.cards = currentPlayer.cards.filter(
        (card) => card != playedCard
      );
      await interaction.reply({
        content: `${currentPlayer.name} played: ${playedCard.info.color} ${
          playedCard.type === CardType.NumberCard
            ? (playedCard.info as NumberCardInfo).number
            : playedCard.type === CardType.ActionCard
            ? (playedCard.info as ActionCardInfo).action
            : (playedCard.info as WildCardInfo).wildType // Handle wild card case if needed
        }`,
        ephemeral: false,
      });
    }

    //remove that card from player list

    //change turn of a player to another player
  }
}

function cardNumberToPrimitive(cardNumber: CardNumber): number {
  return parseInt(cardNumber); // Since enums in TypeScript are numbers by default, this works directly.
}
