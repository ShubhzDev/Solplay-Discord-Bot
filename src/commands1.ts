import { Player } from "./player";
import { ButtonBuilder, ButtonStyle } from "discord.js";
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
}



function ShowDisplayButtons(interaction : any){
    //join will send view ur cards/Uno/leave/end game

    //only view your cards
    
}

function DisplayPlayerOwnCards(intercation : any,player : Player,gameState : GameState){
    for (let index = 0; index < array.length; index++) {
        const element = new ButtonBuilder()
        .setCustomId()
        
    }
}

function ShowTurn(){

    //show timer and turn banner

}


function AddPlayerToGame(){
    //update game state    
}