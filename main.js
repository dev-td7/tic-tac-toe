/**
 * @name: The Tic Tac Toe you can never win.
 * @description: This is an AI enabled Tic Tac Toe game. You play against the Computer, and I dare you to win! Good luck..
 * 
 * This is the main JavaScript file that is responsible for gameplay. 
 * Most of the AI related script is written in the file minimax.js.
 * 
 * There is frequent use of the term "box". Box is one of the 9 units in Tic Tac Toe game where you put an X or an O.
 * 
 * Layout and nomenclature of boxes and lines:
 * 
 *      r1   r2   r3
 *    ----------------
 * c1 | b1 | b2 | b3 |
 * c2 | b4 | b5 | b6 |
 * c3 | b7 | b8 | b9 |
 *    ----------------
 *
 *      r1    r2     r3    
 *    -------------------
 * c1 | d1 |       | d2 |
 * c2 |    | d1,d2 |    |
 * c3 | d1 |       | d2 |
 *    -------------------
 *      
 * @author: Tejas Dastane.
 * @version: 1.0
 * Date: June 8, 2018.
 */

var player = "User";

function declare_winner(player){
	if(player == "User"){
		// User won the game (LOL!)
		let win = document.getElementById('msg')
		win.innerHTML = "You won!";
		win.className = "Win";
	}
	else if(player == "AI"){
		// AI Won the game
		let lose = document.getElementById('msg')
		lose.innerHTML = "You lost!";
		lose.className = "Lose";
	}

	// Flag signifyng game is over and winner has been decided.
	game_over = true;

	// Disable clicking any box.
	for(var i=1;i<10;i++){
		document.getElementById('b'+i).setAttribute('onclick','');
	}
}


class box{
	/**
	 * 
	 * @param {String} box_name: Unique identifier for the box. From b1-b9 only.
	 * @param {Array} lines: The lines that pass through this box.
	 */
	constructor(box_name,lines){
		this.box_name = box_name;
		this.lines = lines;
	}

	registerClick(player){
		/**
		 * Notifies all lines passing through this box that "player" has selected this box.
		 * @param {String} player: Player who selected this box.
		 */
		for(var i=0;i<this.lines.length;i++){
			this.lines[i].registerClick(player);
		}
	}
}

class line{
	/**
	 * 
	 * @param {String} line_name: Unique identifier for the line.
	 * @private {Number} hits: Number of boxes selected on the line.
	 * @private {String} player: Who selected a box on the line first.
	 */
	constructor(line_name){
		this.line_name = line_name;
		this.hits = 0;
		this.player = 0;
	}
	
	registerClick(player){
		if(this.player == 0){
			this.player = player;
			this.hits = 1;
		}
		else if(this.player == player){
			this.hits++;
			if(this.hits == 3){
				declare_winner(player);
			}
		}
	}
}

// Initialise lines and boxes.
var r1 = new line("r1"), r2 = new line("r2"), r3 = new line("r3");
var c1 = new line("c1"), c2 = new line("c2"), c3 = new line("c3");
var d1 = new line("d1"), d2 = new line("d2");

var b1 = new box(0,[r1,c1,d1]), b2 = new box(1,[r1,c2]), b3 = new box(2,[r1,c3,d2]);
var b4 = new box(3,[r2,c1]), b5 = new box(4,[r2,c2,d1,d2]), b6 = new box(5,[r2,c3]);
var b7 = new box(6,[r3,c1,d2]), b8 = new box(7,[r3,c2]), b9 = new box(8,[r3,c3,d1]);

// Create a map of each box to its key.
var boxes = {"b1": b1,"b2": b2,"b3": b3,"b4": b4,"b5": b5,"b6": b6,"b7": b7,"b8": b8,"b9": b9}
var game_over = false;

function clicked(elem){
	/**
	 * Invoked when User plays his turn and hits a box.
	 * @param elem: DOM element clicked.
	 */

	// The DOM object that displays a message.
	let msg = document.getElementById('msg');
	
	// Put an X on that box, disable it's clicking and register that User has clicked that box.
	elem.innerHTML = "<img src='images/X.PNG' alt='X'/>";
	elem.setAttribute("onclick","");
	var currBox = boxes[elem.id];
	console.log("User plays box "+elem.id);
	currBox.registerClick("User");

	// If all cells would be full, and there is no winner, declare a draw.
	if(moves == 8 && !game_over){
		msg.innerHTML = "Game ends in a draw";
		msg.className = "Draw";
		return;
	}

	// AI's turn
	if(!game_over){
		// Using MiniMax tree, determine next move AI should make and register click on that box. Disable it's clicking.
		msg.innerHTML = "Please wait...";

		let next_move = play(Number.parseInt(elem.id[1]));
		msg.innerHTML = "It is your turn to play";
		console.log("AI plays box "+next_move);
		currBox = boxes[next_move];
		currBox.registerClick("AI");

		elem = document.getElementById(next_move);
		elem.innerHTML = "<img src='images/O.PNG' alt='O'/>";
		elem.setAttribute("onclick","");
	}
}