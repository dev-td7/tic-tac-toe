class simulated_box{
	/**
	 * This represents a box out of the 9 boxes. This class is used for simulation purposes of the AI.
	 * @param {String} box_name: A unique identifier for the box. Will be b1..b9 
	 * @param {Array} lines: The lines that pass through this box
	 */
	constructor(box_name,lines){
		this.id = box_name;
		this.lines = lines;
	}
	
	registerClick(player){
		/**
		 * @param {String} player: Whose turn it is - User/AI.
		 */
		for(var i=0;i<this.lines.length;i++){
			/*
				Notify each line that the box has been played, and update the status of each line to check whether any player has completed the line.
				The function will return a String or 0. 0 signifies no one has won the game yet. Else, it returns player who won the game by completing a line.
			*/
			var result = this.lines[i].registerClick(player);
			if(result!=0) break;
		}
		return result;
	}
}

class simulated_line{
	/**
	 * 
	 * @param {String} line_name: A unique identifier for the line
	 * @private {Number} hits: Number of boxes selected on the line.
	 * @private {String} player: Who selected a box on the line first.
	 */
	constructor(line_name){
		this.line_name = line_name;
		this.hits = 0;
		this.player = 0;
	}
	
	registerClick(player){
		/**
		 * Whenever any box on this line is selected, this function is called
		 * @param player: Which player has selected a box on this line.
		 * @returns: Player Name in case either of the players win, else 0.
		 */
		if(this.player == 0){
			// No player had selected any box on this line so far, now the line belongs to this player.
			this.player = player;
			this.hits = 1;
		}
		else if(this.player == player){
			// The same player has selected this line again, increase the number of hits.
			this.hits++;
			if(this.hits == 3){
				// Same player has selected all three boxes, it's a win!
				return player;
			}
		}
		return 0;
	}
}

function min(list_of_nodes){
	/**
	 * This functions takes input as children of a parent node, and returns the minimum score from the children.
	 * This function is always called at the AI level.
	 * @param {Array} list_of_nodes: An array of all children nodes of the parent node whose score is being calculated.
	 * @returns {Number}: The minimum score amongst the children nodes.
	 */

	// Initialise the minimum value. 
	var min_val=9;

	// Calculate the minimum value
	for(var i=0;i<list_of_nodes.length;i++){
		if(list_of_nodes[i].score < min_val){
			min_val = list_of_nodes[i].score;
		}
	}

	// Return to the calling function.
	return min_val;
}

function max(list_of_nodes){
	/**
	 * This function takes input as the children of a parent node, calculates the maximum score and returns the score as well as the node having that max score.
	 * In case multiple nodes have the maximum score, it randomly returns one of the nodes having the maximum score.
	 * This function is always called at User level.
	 * @param list_of_nodes: An array of all children nodes of the parent node whose score is being calculated.
	 * @returns {Array}: The first value in the array is the maximum score and the next value is the node with the maximum score. The returned array has 2 elements only.
	 */

	// Initialise maximum value, and create a list to store all nodes that share the maximum score. Also, create a counter to track the array indexes.
	let max_val=list_of_nodes[0].score, max_boxs = [], max_box_ctr=0;
	for(var i=0;i<list_of_nodes.length;i++){
		if(list_of_nodes[i].score >= max_val){

			// Add to the list all nodes sharing same maximum score.
			if(list_of_nodes[i].score == max_val) max_boxs[max_box_ctr++] = list_of_nodes[i];

			// In case a new maximum score is found, flush the list and re-initialise the counter.
			else{
				max_val = list_of_nodes[i].score;
				max_box_ctr=0;
				max_boxs = [];
				max_boxs[max_box_ctr++] = list_of_nodes[i];
			}
		}
	}

	// Randomly select a node from max_boxs - List of nodes the share same maximum value.
	let max_box_index = Math.floor(Math.random()*(max_box_ctr));
	return [max_val, max_boxs[max_box_index]];
}

class Tree_Node{
	/**
	 * 
	 * @param {String} label: Label for that node. Only from b1 to b9.
	 * @param {Tree_Node} parent_node: Parent node of the current node.
	 * @private {Tree_Node[]} children: List of children of this node.
	 * @private {Boolean} is_leaf: Signifies whether this node is leaf node or not.
	 * @private {Array} path: List of labels of all nodes from root to this node.
	 * @private {Tree_Node} next_move: Only present at User level, it gives AI it's next move.
	 */
	constructor(label, parent_node){
		this.label = label;
		this.children = [];
		this.is_leaf = false;
		this.score = 0;
		this.path = [];
		this.next_move = '';

		// Root node has no parent. Check if this node is not root node.
		if(typeof parent_node != 'undefined'){

			// Register as a child with it's parent node.
			parent_node.add_child(this);

			// Copy parent node's path and append itself to it.
			for(var i=0;i<parent_node.path.length;i++){
				this.path[i] = parent_node.path[i];
			}
			this.path[this.path.length] = this.label;

			// Set depth of the node.
			this.level = parent_node.level + 1;
		}
		else this.level = 0;							// Root node
	}
	
	add_child(child_node){
		/**
		 * Adds child node to a parent node.
		 * @param {Tree_Node} child_node: The child node.
		 */
		this.children[this.children.length] = child_node;
	}
	
	set_as_leaf_node(){
		/**
		 * Sets the current node as leaf node. Also used to keep a count of no. of paths.
		 */
		this.is_leaf = true;
		if(typeof Tree_Node.paths == 'undefined') Tree_Node.paths = 0;
		Tree_Node.paths += 1;
	}
	
	calculate_score(){
		/**
		 * Calculates score of a node.
		 */

		/*
			If node is a leaf node, there is no previous information available as there are no children.
			This code simulates each path and calculates score for that node. Score is negative if AI loses and positive if it wins.
			Magnitude of the score is dependent on how early the AI wins/loses. Earlier the outcome, higher the magnitude.
		*/
		if(this.is_leaf){

			// Initialise lines and boxes for simulation
			let r1 = new simulated_line("r1"), r2 = new simulated_line("r2"), r3 = new simulated_line("r3");
			let c1 = new simulated_line("c1"), c2 = new simulated_line("c2"), c3 = new simulated_line("c3");
			let d1 = new simulated_line("d1"), d2 = new simulated_line("d2");

			let b1 = new simulated_box(0,[r1,c1,d1]);
			let b2 = new simulated_box(1,[r1,c2]);
			let b3 = new simulated_box(2,[r1,c3,d2]);
			let b4 = new simulated_box(3,[r2,c1]);
			let b5 = new simulated_box(4,[r2,c2,d1,d2]);
			let b6 = new simulated_box(5,[r2,c3]);
			let b7 = new simulated_box(6,[r3,c1,d2]);
			let b8 = new simulated_box(7,[r3,c2]);
			let b9 = new simulated_box(8,[r3,c3,d1]);

			// Map box objects to their keys. Initialise player to user.
			var box_map = {"b1": b1,"b2": b2,"b3": b3,"b4": b4,"b5": b5,"b6": b6,"b7": b7,"b8": b8,"b9": b9};
			var player = "User";

			for(var i=0;i<this.path.length;i++){

				// Go through each box in the path of this leaf node and simulate a selection.
				var this_box = this.path[i];
				var box = box_map[this_box];

				// If there is a winner in the mean while, determine sign and magnitude of the score and break the simulation.
				let possible_winner = box.registerClick(player)
				if(possible_winner == "User"){
					this.score = i-9;
					break;
				}
				if(possible_winner == "AI"){
					this.score = 9-i;
					break;
				}

				// Toggle between players
				player = player=="User"? "AI" : "User";
			}
		}
		else{

			/*
				This section of code is applicable to non-leaf nodes.
				Nodes representing AI's selections calculate their score as the minimum damage that would be caused by the User's selection, i.e. minimum score of their children.
				Nodes representing Users's selections calculate their score as the maximum damage that could be inflicted by the AI's selection, i.e. maximum score of their children.
			*/

			if(this.level % 2 == 0){								// AI level
				this.score = min(this.children);
			}
			else if(this.level % 2 == 1){							// User level
				let max_result = max(this.children);
				this.score = max_result[0];

				// Set next move for AI.
				this.next_move = max_result[1];
			}
		}
	}
}

function tree_builder(curr_node, boxes, level){
	/**
	 * This function creates a MiniMax Tree. It determines all paths possible and calculates the best path to follow for the AI.
	 * The tree is created using a Depth-First approach.
	 * @param curr_node: The node whose child will be created
	 * @param level: Depth of the node in the tree. 0 is reserved for the root node.
	 */

	// This is deepest the tree can go. We have reached the leaf node.
	if(boxes.length == 0) {
		curr_node.set_as_leaf_node();
	}

	// If there are more boxes available, generate children for the parent node (curr_node).
	for(var i=0;i<boxes.length;i++){

		// Create a new child and add it to the parent.
		let this_node = new Tree_Node("b"+boxes[i], curr_node);

		// Generate a new list of available boxes for the child. 
		let new_boxes = [];
		for(var j=0;j<boxes.length;j++){
			new_boxes[j]=boxes[j];
		}
		new_boxes.splice(i,1);

		// Generate children for this newly create node.
		tree_builder(this_node,new_boxes,level+1);

		// All children for this node have been created. Calculate the score.
		this_node.calculate_score();
	}
}

// Global variables
var root = new Tree_Node("root", undefined), current_node = root;
var moves = 0, available_boxes = [1,2,3,4,5,6,7,8,9];

function play(box_number){
	/**
	 * This function is called when User's clicks any of the boxes. 
	 * It is responsible for creation of the MiniMax tree and also it's proper traversal.
	 * @param {Number} box_number: The box selected by the User. One amongst b1-b9.
	 * @returns {String} next_move: The next move determined by the AI.
	 */
	if(moves % 2 == 0){												// User's turn to play
		if(moves == 0){
			// User - Turn 1
			var box = new Tree_Node("b"+box_number, current_node);
			current_node = box;
		}
		else{
			// User - Any other turn
			let children = current_node.children;
			let child_index = 0;

			// Search for the box number in labels of children of the current node.
			for(var i=0;i<children.length;i++){
				if(children[i].label == "b"+box_number){
					child_index = i;
					break;
				}
			}
			current_node = children[child_index];
		}

		// Increment moves and remove selected boxes from list of available boxes.
		available_boxes.splice(available_boxes.indexOf(box_number),1);
		moves += 1;
	}
	if(moves % 2 == 1){												// AI's turn to play
		if(moves == 1){
			// User has played the first turn. Start building the MiniMax tree so the AI can play.
			tree_builder(current_node, available_boxes, 1);
			current_node.calculate_score();
		}

		// Determine what move should be made by the AI.
		var next_move = current_node.next_move.label;

		// Remove the box selected by AI from the list of available boxes, and increment moves.
		available_boxes.splice(available_boxes.indexOf(Number.parseInt(next_move[1])),1);
		moves++;
		current_node = current_node.next_move;

		// Return the move determined by AI to the calling function.
		return next_move;
	}
}