import { Player } from "./player";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { GameState } from "./gameState";


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

function DisplayPlayerOwnCards(intercation : any,player : Player,gameState : GameState){
    const cardsLength = player.cards.length;
    const cards = player.cards;
    for (let index = 0; index < player.cards.length; index++) {
        const [color ,card , id ] = cards[index].split("_");
        const element = new ButtonBuilder()
        .setCustomId(cards[index].id)
        .setLabel(color+card+id)
        .setStyle(ButtonStyle.Primary);
    }
}

function ShowTurn(){

    //show timer and turn banner

}


function AddPlayerToGame(){
    //update game state   
}