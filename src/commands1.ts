import { Player } from "./player";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AddPlayer, GameState, nextPlayer } from "./gameState";
import { TextChannel } from "discord.js";
import { GameManager} from "./GameManager";

export const manager = new GameManager();

enum ButtonId{
    Join = "join",
    ViewCard = "viewCard",
    Uno = "uno",
    Leave = "leave",
    Play = "play",
    Draw = "draw",  
}

export let gameState: GameState;

export async function SendUnoJoinInvitationToAllPlayers(channel:TextChannel){
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

    const rows : ActionRowBuilder<ButtonBuilder>[] = [];
    rows.push(viewJoinBtn);

    await channel.send({
        content:"Click a Button to Join Uno Game!!!",
        components:rows,
    })
}


export async function ShowDisplayButtons(interaction : any){
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
        viewCard,uno,leave,
    );


    await interaction.reply({
        components:[showDisplayButtons],
        ephimeral:true,
    });

    AddPlayer(interaction.id,interaction.name,"1111");
}

const rows :  ActionRowBuilder<ButtonBuilder>[] = [];
let currentRow = new ActionRowBuilder<ButtonBuilder>();
const addCardButton = (id:string,label:string,isEnabled:boolean) => {
    currentRow.addComponents(
        new ButtonBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(isEnabled ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!isEnabled)
    )

   // Push the last row if it has any buttons
    if (currentRow.components.length >= 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
};


async function DisplayPlayerOwnCards(interaction : any,player : Player,gameState : GameState){
    const cardsLength = player.cards.length;
    const cards = player.cards;
    for (let index = 0; index < player.cards.length; index++) {
        const [color ,card , id ] = cards[index].id.split("_");
        const enabled : boolean = true;
        addCardButton(cards[index].id,"play_"+color+card,enabled);
    }

    await interaction.reply({
        components:rows,
        ephimeral:true,
    });
}

function ChangeTurn(gameState : GameState){
    nextPlayer(gameState);
}

function ShowTurn(){
    //show timer and turn banner

}

function OnButtonInteraction(player:Player,gameState:GameState){
    //check if player turn
    if(player === gameState.players[gameState.currentPlayerIndex]){ //should check player id or name from databse
        
    }
}


function AddPlayerToGame(player : Player,gameState : GameState){
    //update game state
    gameState.players.push(player);
}

export function HandleInteractions(interaction : any,player : Player,gameState : GameState,channel:TextChannel){
    const id = interaction.customId;
    console.log("id "+id);
    switch(id){
        case ButtonId.Join:{
            ShowDisplayButtons(interaction);
        }
        break;

        case ButtonId.ViewCard:{
            DisplayPlayerOwnCards(interaction,player,gameState);
        }
        break;

        case ButtonId.Uno:{
        }
        break;

        case ButtonId.Leave:{
            //remove player from list
        }
        break;

        case ButtonId.Play:{
            //move game logic
        }
        break;

        case ButtonId.Draw:{
        }
        break;

        default:
            console.log("came in default section");

    }
}