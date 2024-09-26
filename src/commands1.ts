import { Player } from "./player";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { GameState, nextPlayer } from "./gameState";


function SendUnoJoinInvitationToAllPlayers(){
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
}


async function ShowDisplayButtons(interaction : any){
    //join will send view ur cards/Uno/leave/end game

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
        content:showDisplayButtons,
        ethemeral:true,
    });

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


function DisplayPlayerOwnCards(intercation : any,player : Player,gameState : GameState){
    const cardsLength = player.cards.length;
    const cards = player.cards;
    for (let index = 0; index < player.cards.length; index++) {
        const [color ,card , id ] = cards[index].split("_");
        const enabled : boolean = true;
        addCardButton(cards[index].id,color+card,enabled);
    }
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