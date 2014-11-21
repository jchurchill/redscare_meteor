Games = new Mongo.Collection("games");

var game = {
	// Setup information
	name: "Randolph Towers Game Night",
	dateCreated: '2014-11-11 00:00:00',
	creator: 348579892,
	playerCount: 6,
	roles: [1,1,2,2,2,3], // see ROLES enum in game_presets
	// Filled in after game begins
	players: [238472394, 234985728, 2093842980 /* and 3 more*/],
	playerRoles: { 
		"238472394": 1,
		"234985728": 2,
		"2093842980": 2
		/* and 3 more */
	},
	// Updated as time progresses
	isOver: true,
	outcome: 1, // See OUTCOMES enum in game_presets
	currentLeader: 238472394,
	currentRound: 2,
	passedRoundsCount: 1,
	failedRoundsCount: 1,
	rounds: {
		1: {
			nomineeCount: 2,
			currentNominationNumber: 2,
			nominations: {
				1: {
					leader: 238472394,
					nominees: [238472394, 234985728],
					votes: {
						"238472394": true,
						"234985728": false,
						"2093842980": false
						/* and 3 more */
					},
					approved: false
				},
				2: {
					leader: 234985728,
					nominees: [238472394, 234985728],
					votes: {
						"238472394": true,
						"234985728": true,
						"2093842980": false
						/* and 3 more */
					},
					approved: true
				}
			},
			mission: {
				nominationNumber: 2,
				nominees: [238472394, 234985728],
				votes: {
					"238472394": true,
					"234985728": false
				},
				passed: false
			}
		},
		2: {
			/* roughly the same as above */
		}
		/* 3 more populated as game progresses */
	},
	/* optional, depending on presence of merlin / assassin in the game */
	assassination: { player: 234985728, killedMerlin: false }
};

/*
Game state progression:
* Creation
	- Host fills out some details, hits submit
	- Immediately transition to next state
* Waiting for players to join
	- Joining a game adds player to players
	- If players.length === playerCount ->
		- Move to next state
		- Starting leader is assigned
		- Roles are assigned
		- Other basic intialization of top-level properties
* Round begins
	- Set nominee count based on round num & game rules
* Nomination begins
	- leader = currentLeader
	- currentNominationNumber += 1
	* Wait for leader to make nominations
		- If nominees.length === nomineeCount ->
			- Move to next state
	* Wait for players to put in approval votes
		- If votes.length === playerCount ->
			- Set approved = true if majority of players upvoted, else false
			- If approved = false and currentNominationNumber <= 4 ->
				- Move to next state: nomination begins
			- If approved = false and currentNominationNumber === 5 ->
				- Move to next state: game over, OUTCOME = EVIL_WINS_FROM_DOWNVOTES
			- If approved = true ->
				- Move to next state: mission
* Mission begins
	- Copy over info from the approved nomination
	* Wait for nominees to past their pass/fails
		- If votes.length === nomineeCount ->
			- Set value of passed based on number of fails & game rules
			- Update passedRoundsCount / failedRoundsCount
			- If passedRoundsCount === 3 && game does not contain merlin ->
				- Move to next state: game over, OUTCOME = GOOD_WINS
			- If passedRoundsCount === 3 && game does contain merlin ->
				- Move to next state: assassination
			- If failedRoundsCount === 3 ->
				- Move to next state: game over, OUTCOME = EVIL_WINS_FROM_FAILS
			- Else ->
				- Update currentRound += 1
				- Move to next state: Round begins
* Assassination (optional)
	* Wait for assassin to choose a victim
		- If victim === merlin ->
			- Set killedMerlin = true
			- Move to next state: game over, OUTCOME = EVIL_WINS_FROM_ASSASSINATION
		- Else ->
			- Move to next state: game over, OUTCOME = GOOD_WINS
* Game over
	- Update gameFinishedAt
	- Set isGameOver = true
*/

// TODO: for testing only. delete this
if(Meteor.isServer) {
	Meteor.startup(function() {
		Games.insert({ name: "my game", players: [1,2,3] });
		Games.insert({ name: "my second game", status: "merlin got assassinated!!" });
	});
}