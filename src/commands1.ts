import { Player } from "./player";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Component,
  EmbedBuilder,
} from "discord.js";
import { AddPlayer, GameState, nextPlayer, startGame } from "./gameState";
import { TextChannel } from "discord.js";
import { GameManager } from "./GameManager";
import {
  ActionCardInfo,
  CardNumber,
  CardType,
  getCardImg,
  NumberCardInfo,
  WildCardInfo,
} from "./card";
import { displayCurrentCard } from "./game";
import { channel } from "diagnostics_channel";

export const manager = new GameManager();

enum ButtonId {
  Join = "join",
  ViewCard = "viewCard",
  Uno = "uno",
  Leave = "leave",
  Play = "play",
  Draw = "draw",
}

export let gameState: GameState;

export async function SendUnoJoinInvitationToAllPlayers(interaction: any) {
  //send 4 buttons to channel
  //start
  //cancel
  //join
  //leave game

  //only join is needed
  const joinGame = new ButtonBuilder()
    .setCustomId("join")
    .setLabel("Join")
    .setStyle(ButtonStyle.Success);

  const viewJoinBtn = new ActionRowBuilder<ButtonBuilder>();
  viewJoinBtn.addComponents(joinGame);

  // const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  // rows.push(viewJoinBtn);

  EmbeddedBuilder(
    interaction,
    interaction.user.username,
    interaction.channel,
    viewJoinBtn
  );
  // await channel.send({
  //   content: "Click a Button to Join Uno Game!!!",
  //   components: rows,
  // });
}

export async function ShowDisplayButtons(
  interaction: any,
  gameState: GameState
) {
  //join will send view ur cards/Uno/leave/end game

  console.log("ShowDisplayButtons");
  const viewCard = new ButtonBuilder()
    .setCustomId("viewCard")
    .setLabel("View")
    .setStyle(ButtonStyle.Primary);

  const uno = new ButtonBuilder()
    .setCustomId("uno")
    .setLabel("!Uno")
    .setStyle(ButtonStyle.Primary);

  const leave = new ButtonBuilder()
    .setCustomId("leave")
    .setLabel("Leave")
    .setStyle(ButtonStyle.Primary);

  const draw = new ButtonBuilder()
    .setCustomId("draw")
    .setLabel("Draw")
    .setStyle(ButtonStyle.Primary);



  let showDisplayButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    viewCard,
    uno,
    leave,
    draw
  );

  TurnUpdate(
    interaction,
    gameState.players[gameState.currentPlayerIndex],
    gameState
  );

  msgInteraction = await interaction.reply({
    components: [showDisplayButtons],
    ephemeral: true,
  });

  // AddPlayer(interaction.id, interaction.name, "game1");
}

export async function ShowDisplayButtonsAddPass(
  interaction: any,
  gameState: GameState,
  addPass : boolean
) {
  //join will send view ur cards/Uno/leave/end game

  console.log("ShowDisplayButtons");
  const viewCard = new ButtonBuilder()
    .setCustomId("viewCard")
    .setLabel("View")
    .setStyle(ButtonStyle.Primary);

  const uno = new ButtonBuilder()
    .setCustomId("uno")
    .setLabel("!Uno")
    .setStyle(ButtonStyle.Primary);

  const leave = new ButtonBuilder()
    .setCustomId("leave")
    .setLabel("Leave")
    .setStyle(ButtonStyle.Primary);

  const draw = new ButtonBuilder()
    .setCustomId("draw")
    .setLabel("Draw")
    .setStyle(ButtonStyle.Primary);



  let showDisplayButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    viewCard,
    uno,
    leave,
    draw
  );

  let pass : any;
  if(addPass){
    pass = new ButtonBuilder()
    .setCustomId("pass")
    .setLabel("Pass")
    .setStyle(ButtonStyle.Primary);
showDisplayButtons.addComponents(pass);
  }

  await interaction.update({
    components: [showDisplayButtons],
    ephemeral: true,
  });

  TurnUpdate(
    interaction,
    gameState.players[gameState.currentPlayerIndex],
    gameState
  );



  // AddPlayer(interaction.id, interaction.name, "game1");
}

let rows: ActionRowBuilder<ButtonBuilder>[];
let currentRow: ActionRowBuilder<ButtonBuilder>;
const addCardButton = (id: string, label: string, isEnabled: boolean) => {
  currentRow.addComponents(
    new ButtonBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(isEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary)
      .setDisabled(!isEnabled)
  );

  // Push the last row if it has any buttons
  if (currentRow.components.length >= 5) {
    console.log("currentRow.components.length ", currentRow.components.length);
    rows.push(currentRow);
    currentRow = new ActionRowBuilder<ButtonBuilder>();
  }
};

async function DisplayPlayerOwnCards(interaction: any, player: Player) {
  const cardsLength = player.cards.length;
  console.log("cardsLength ", cardsLength);
  const cards = player.cards;
  rows = [];
  currentRow = new ActionRowBuilder<ButtonBuilder>();
  for (let index = 0; index < cardsLength; index++) {
    const [color, card, id] = cards[index].id.split("_");
    const enabled: boolean = true;
    addCardButton("play_" + cards[index].id, color + card, enabled);
  }

  // After adding all cards, check and push any remaining buttons
  if (currentRow.components.length > 0) {
    console.log(
      "Pushing final currentRow with length: ",
      currentRow.components.length
    );
    rows.push(currentRow);
  }
  // msgInteraction = interaction;

  await interaction.reply({
    components: rows,
    ephemeral: true,
  });
}

async function DisplayPlayerOwnCardsEdit(interaction: any, player: Player) {
  const cardsLength = player.cards.length;
  console.log("cardsLength ", cardsLength);
  const cards = player.cards;
  rows = [];
  currentRow = new ActionRowBuilder<ButtonBuilder>();
  for (let index = 0; index < cardsLength; index++) {
    const [color, card, id] = cards[index].id.split("_");
    const enabled: boolean = true;
    addCardButton("play_" + cards[index].id, color + card, enabled);
  }

  // After adding all cards, check and push any remaining buttons
  if (currentRow.components.length > 0) {
    console.log(
      "Pushing final currentRow with length: ",
      currentRow.components.length
    );
    rows.push(currentRow);
  }
  // await interaction.deferReply({ ephemeral: true });

  await interaction.update({
    components: rows,
    ephemeral: true,
  });
}

function ChangeTurn(gameState: GameState) {
  nextPlayer(gameState);
}

function ShowTurn() {
  //show timer and turn banner
}

function OnButtonInteraction(player: Player, gameState: GameState) {
  //check if player turn
  if (player === gameState.players[gameState.currentPlayerIndex]) {
    //should check player id or name from databse
  }
}

function AddPlayerToGame(player: Player, gameState: GameState) {
  //update game state
  gameState.players.push(player);
}

let msgInteraction: any;

export async function HandleInteractions(
  interaction: any,
  channel: TextChannel
) {
  const [id, cardColor, cardValue] = interaction.customId.split("_");
  const userId = interaction.user.id;
  const userName = interaction.user.username;
  let gameState: GameState | undefined = manager.getGameState("game1");

  console.log("id " + id);
  switch (id) {
    case ButtonId.Join:
      {
        if (gameState) {
          // console.log("gameState.players.length ",gameState.players.length);
          manager.addPlayer(userId, userName, "game1");
          // await channel.send(`${userName} has joined game`);

          if (gameState.players.length == 2 && !gameState.isActive) {
            gameState.isActive = true;
            console.log("gameState.players.length ", gameState.players.length);
            startGame(interaction, gameState);
            const { player } = getPlayerfromId(userId, "game1");
            if (player) {
              ShowDisplayButtons(interaction, gameState);
              // TurnUpdate(
              //   interaction,
              //   gameState.players[gameState.currentPlayerIndex],
              //   gameState
              // );
            }
            // EmbeddedBuilder(interaction.channel);
          }
        } else {
          console.log("else");
          manager.createGame("game1");
          manager.addPlayer(userId, userName, "game1");
          gameState = manager.getGameState("game1");
          const { player } = getPlayerfromId(userId, "game1");
          if (player && gameState) {
            ShowDisplayButtons(interaction, gameState);
          }
        }

        // Re-fetch the game state after adding the player
        gameState = manager.getGameState("game1"); // Re-fetching the updated game state
        const { player } = getPlayerfromId(userId, "game1");
        if (player && gameState && !gameState.isActive) {
          Joined(interaction, gameState, player, channel);
        }
      }
      break;

    case ButtonId.ViewCard:
      {
        const { player, gameState } = getPlayerfromId(userId, "game1");
        if (player && gameState) {
          DisplayPlayerOwnCards(interaction, player);
        }
      }
      break;

    case ButtonId.Uno:
      {
      }
      break;

    case ButtonId.Leave:
      {
        //remove player from list
      }
      break;

    case ButtonId.Play:
      {
        const { player, gameState } = getPlayerfromId(userId, "game1");
        if (player && gameState) {
          // const [cardColor, cardValue] = interaction.customId.split("_");
          //move game logic
          await PlayCardLogic(interaction, cardColor, cardValue, gameState);
          // Update the UI for the next player's turn
          // displayCurrentCard(channel, gameState);
          DisplayPlayerOwnCardsEdit(interaction, player);
        }
      }
      break;

    case ButtonId.Draw:
      {
        const { player, gameState } = getPlayerfromId(userId, "game1");
        if (player && gameState) {
          DrawCardLogic(interaction, cardColor, cardValue, gameState);
          DisplayPlayerOwnCardsEdit(interaction, player);
        }
      }
      break;

    default:
      console.log("came in default section");
  }
}

function getPlayerfromId(
  playerId: string,
  gameId: string
): { player: Player | undefined; gameState: GameState | undefined } {
  const gameState: GameState | undefined = manager.getGameState(gameId);
  if (gameState) {
    // console.log("gameState.players.length "+ gameState.players.length);
    for (let i = 0; i < gameState.players.length; i++) {
      console.log(`${gameState.players[i].name} player...`);
      if (playerId === gameState.players[i].id) {
        return { player: gameState.players[i], gameState }; // Return as an object
      }
    }
  }
  return { player: undefined, gameState }; // Return as an object
}

async function PlayCardLogic(
  interaction: any,
  cardColor: string,
  cardValue: string,
  gameState: GameState
) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const textChannel = interaction.channel as TextChannel;

  const playedCard = currentPlayer.cards.find((card) => {
    if (card.type === CardType.NumberCard) {
      const numberInfo = card.info as NumberCardInfo;
      return (
        numberInfo.color === cardColor &&
        cardNumberToPrimitive(numberInfo.number) === parseInt(cardValue)
      );
    } else if (card.type === CardType.ActionCard) {
      const actionInfo = card.info as ActionCardInfo;
      return actionInfo.color === cardColor && actionInfo.action === cardValue;
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

    // Change turn to next player
    gameState.currentPlayerIndex =
      (gameState.currentPlayerIndex + 1) % gameState.players.length;

    TurnUpdate(
      interaction,
      gameState.players[gameState.currentPlayerIndex],
      gameState
    );
  }
}

function DrawCardLogic(
  interaction: any,
  cardColor: string,
  cardValue: string,
  gameState: GameState
) {
  const drawnCard = gameState.deck.pop();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  if (drawnCard) {
    currentPlayer.cards.push(drawnCard);
  }

  ShowDisplayButtonsAddPass(interaction, gameState,true);

}

/**
 * Converts a CardNumber enum to a primitive number.
 * @param cardNumber The CardNumber enum value.
 */
function cardNumberToPrimitive(cardNumber: CardNumber): number {
  return parseInt(cardNumber);
}

let message: any;
let description: string = "";
let lastDescription: string = "";
async function EmbeddedBuilder(
  interaction: any,
  playerName: string,
  channel: TextChannel,
  rows: any
) {
  lastDescription +=
    playerName +
    " has started a game of UNO! Click the button below to join!\n\n";

  const embedded = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("UNO")
    .setDescription(lastDescription);
  message = await channel.send({ embeds: [embedded], components: [rows] });
}

async function Joined(
  interaction: any,
  gameState: GameState,
  player: Player,
  channel: TextChannel
) {
  let playerList: string = "";
  for (let i = 0; i < gameState.players.length; i++) {
    playerList += gameState.players[i].name + "\n";
  }
  description = playerList;

  description += "\n" + player.name + " has just Joined!\n\n";
  const embedded = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("UNO")
    .setDescription(lastDescription + description);

  message.edit({ embeds: [embedded] });
}

async function TurnUpdate(
  interaction: any,
  turnPlayer: Player,
  gameState: GameState
) {
  const turn = turnPlayer.name + "'s Turn";
  const turnMsg = "It's " + turnPlayer.name + "'s turn";

  let playerListAndCards: string = "";
  for (let index = 0; index < gameState.players.length; index++) {
    playerListAndCards +=
      gameState.players[index].name +
      " - " +
      gameState.players[index].cards.length +
      " cards" +
      "\n";
  }

  let url: string | undefined =
    "https://raw.githubusercontent.com/WilliamWelsh/UNO/main/images/" +
    getCardImg(gameState.currentCard);

  console.log("url", url);
  const targetUser = await interaction.guild.members
    .fetch(turnPlayer.id)
    .catch(console.error);

    if(!gameState.isActive){
      url = "";
    }

  if (url && targetUser) {
    const embedded = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: turn,
        iconURL: targetUser.displayAvatarURL({ dynamic: true }),
      })
      .addFields(
        { name: "\u200B", value: turnMsg, inline: false }, // Using zero-width space for empty fields
        { name: "Press the view card button below to view your cards.",value: "\u200B", inline: false},
        { name: "Players",value: playerListAndCards || "\u200B",inline: true}//, // Fallback to zero-width space if `playerListAndCards` is empty
      )
      .setThumbnail(`${url}`);

    await message.edit({ embeds: [embedded] ,components : []});
  }
}
