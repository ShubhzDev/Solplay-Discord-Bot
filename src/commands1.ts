import { Player } from "./player";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AddPlayer, GameState, nextPlayer, startGame } from "./gameState";
import { TextChannel } from "discord.js";
import { GameManager } from "./GameManager";

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

export async function SendUnoJoinInvitationToAllPlayers(channel: TextChannel) {
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

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  rows.push(viewJoinBtn);

  await channel.send({
    content: "Click a Button to Join Uno Game!!!",
    components: rows,
  });
}

export async function ShowDisplayButtons(interaction: any) {
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

  let showDisplayButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    viewCard,
    uno,
    leave
  );

  await interaction.reply({
    components: [showDisplayButtons],
    ephimeral: true,
  });

  AddPlayer(interaction.id, interaction.name, "game1");
}

const rows: ActionRowBuilder<ButtonBuilder>[] = [];
let currentRow = new ActionRowBuilder<ButtonBuilder>();
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
    rows.push(currentRow);
    currentRow = new ActionRowBuilder<ButtonBuilder>();
  }
};

async function DisplayPlayerOwnCards(
  interaction: any,
  player: Player
) {
  const cardsLength = player.cards.length;
  console.log("cardsLength ",cardsLength);
  const cards = player.cards;
  for (let index = 0; index < cardsLength; index++) {
    const [color, card, id] = cards[index].id.split("_");
    const enabled: boolean = true;
    addCardButton("play_" + cards[index].id,color + card, enabled);
  }

  await interaction.reply({
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

export async function HandleInteractions(interaction: any, channel: TextChannel) {
  const id = interaction.customId;
  const userId = interaction.user.id;
  const userName = interaction.user.username;
  const gameState : GameState | undefined = manager.getGameState("game1");

  console.log("id " + id);
  switch (id) {
    case ButtonId.Join:
      {
        if (gameState) {
          // console.log("gameState.players.length ",gameState.players.length);
          manager.addPlayer(userId, userName, "game1");
          await channel.send(`${userName} has joined game`);
          // interaction.reply(`${userName} has joined game`);

          if (gameState.players.length == 2 && !gameState.isActive) {
            gameState.isActive = true;
            console.log("gameState.players.length ",gameState.players.length);
            startGame(interaction, gameState);
            ShowDisplayButtons(interaction);
          }
          // else if (gameState.players.length < 2) {
          //   console.log("gameState.players.length");
          //   manager.createGame("game1");
          //   manager.addPlayer(userId, userName, "game1");
          //   interaction.reply(`${userName} has joined game`);
          //   // ShowDisplayButtons(interaction);
          // }
        }
        else{
          console.log("else");
          manager.createGame("game1");
          manager.addPlayer(userId, userName, "game1");
          interaction.reply(`${userName} has joined game`);
          // ShowDisplayButtons(interaction);
        }
      }
      break;

    case ButtonId.ViewCard:
      {  
        const { player , gameState } = getPlayerfromId(userId,"game1");
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
        //move game logic
      }
      break;

    case ButtonId.Draw:
      {
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
