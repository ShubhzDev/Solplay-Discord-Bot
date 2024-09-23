import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  TextChannel,
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

export let gameState: GameState;

/**
 * Handles the /uno command to start a game of Uno.
 * @param interaction The interaction object from Discord.
 */
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

  // Display each player's cards privately
  for (const player of players) {
    const playerCardsMessage =
      `${player.name}, your cards are:\n` +
      player.cards
        .map((card) => {
          if (card.type === CardType.NumberCard) {
            const numberInfo = card.info as NumberCardInfo;
            return `${numberInfo.color} ${numberInfo.number}`;
          } else if (card.type === CardType.ActionCard) {
            const actionInfo = card.info as ActionCardInfo;
            return `${actionInfo.color} ${actionInfo.action}`;
          } else if (card.type === CardType.WildCard) {
            const wildInfo = card.info as WildCardInfo;
            return `${wildInfo.color} ${wildInfo.wildType}`;
          }
          return "";
        })
        .join("\n");

    // Send an ephemeral message to each player with their cards
    await interaction.followUp({
      content: playerCardsMessage,
      ephemeral: true, // This makes the message visible only to the specific player
    });
  }

  displayCurrentCard(textChannel, gameState);

  await displayCardButtons(
    interaction,
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
  interaction: any,
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
  }

  // Push the last row if it has any buttons
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  // Add View Cards button (always enabled), in a new row
  const viewCardsRow = new ActionRowBuilder<ButtonBuilder>();
  viewCardsRow.addComponents(
    new ButtonBuilder()
      .setCustomId("view_cards")
      .setLabel("View My Cards")
      .setStyle(ButtonStyle.Primary)
  );

  rows.push(viewCardsRow); // Add view cards button row

  // Add draw card button (always enabled), in a new row if needed
  const drawCardRow = new ActionRowBuilder<ButtonBuilder>();
  drawCardRow.addComponents(
    new ButtonBuilder()
      .setCustomId("draw_card")
      .setLabel("Draw Card")
      .setStyle(ButtonStyle.Secondary)
  );

  rows.push(drawCardRow); // Add draw card button row

  //  const response = await channel.send({
  //    content: `${currentPlayer.name}, choose a card to play or draw a card:`,
  //    components: rows,
  //  });

  const response = await interaction.followUp({
    components: rows,
    ephemeral: true, // This makes the message visible only to the specific player
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 3_600_000,
  });

  collector.on("collect", async (interaction: any) => {
    console.log("Interaction received:", interaction);

    if (interaction.isButton()) {
      const channel = interaction.channel;

      if (channel && channel instanceof TextChannel) {
        const currentPlayerIndex = gameState.currentPlayerIndex;
        const currentPlayer = gameState.players[currentPlayerIndex];

        if (currentPlayer) {
          await handleButtonInteraction(
            interaction,
            currentPlayer,
            gameState,
            channel
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

/**
 * Handles button interactions for playing cards and drawing cards.
 * @param interaction The interaction object from Discord.
 * @param currentPlayer The player whose turn it is.
 * @param gameState The current game state.
 * @param channel The text channel where the interaction occurred.
 */
export async function handleButtonInteraction(
  interaction: any,
  currentPlayer: Player,
  gameState: GameState,
  channel: TextChannel
) {
  const [action] = interaction.customId.split("_");

  if (action === "view_cards") {
    // Prepare message with player's cards
    const playerCardsMessage =
      `${currentPlayer.name}, your cards are:\n` +
      currentPlayer.cards
        .map((card) => {
          if (card.type === CardType.NumberCard) {
            const numberInfo = card.info as NumberCardInfo;
            return `${numberInfo.color} ${numberInfo.number}`;
          } else if (card.type === CardType.ActionCard) {
            const actionInfo = card.info as ActionCardInfo;
            return `${actionInfo.color} ${actionInfo.action}`;
          } else if (card.type === CardType.WildCard) {
            const wildInfo = card.info as WildCardInfo;
            return `${wildInfo.color} ${wildInfo.wildType}`;
          }
          return "";
        })
        .join("\n");

    await interaction.reply({
      content: playerCardsMessage,
      ephemeral: true,
    });

    return;
  }

  if (action === "draw_card") {
    // Logic for drawing a card from the deck
    const drawnCard = gameState.deck.pop(); // Remove the last card from the deck

    if (drawnCard) {
      currentPlayer.cards.push(drawnCard); // Add the drawn card to the player's hand

      await interaction.reply({
        content: `${currentPlayer.name} drew a card.`,
        ephemeral: true,
      });

      // Check for valid moves after drawing a card and update UI accordingly
      await displayCardButtons(interaction, channel, gameState, currentPlayer);
    } else {
      await interaction.reply({
        content: "No more cards left in the deck!",
        ephemeral: true,
      });
    }

    return;
  }

  const [cardColor, cardValue] = action.split("_");

  if (action === "play") {
    const playedCard = currentPlayer.cards.find((card) => {
      if (card.type === CardType.NumberCard) {
        const numberInfo = card.info as NumberCardInfo;
        return (
          numberInfo.color === cardColor &&
          cardNumberToPrimitive(numberInfo.number) === parseInt(cardValue)
        );
      } else if (card.type === CardType.ActionCard) {
        const actionInfo = card.info as ActionCardInfo;
        return (
          actionInfo.color === cardColor && actionInfo.action === cardValue
        );
      } else if (card.type === CardType.WildCard) {
        const wildInfo = card.info as WildCardInfo;
        return wildInfo.color === cardColor && wildInfo.wildType === cardValue;
      }
      return false;
    });

    if (playedCard) {
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
            : (playedCard.info as WildCardInfo).wildType
        }`,
        ephemeral: false,
      });

      // Change turn to next player
      gameState.currentPlayerIndex =
        (gameState.currentPlayerIndex + 1) % gameState.players.length;

      // Update the UI for the next player's turn
      await displayCurrentCard(channel, gameState);
      await displayCardButtons(
        interaction,
        channel,
        gameState,
        gameState.players[gameState.currentPlayerIndex]
      );
    }
  }
}

/**
 * Converts a CardNumber enum to a primitive number.
 * @param cardNumber The CardNumber enum value.
 */
function cardNumberToPrimitive(cardNumber: CardNumber): number {
  return parseInt(cardNumber);
}
