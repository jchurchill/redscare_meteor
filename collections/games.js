Games = new Mongo.Collection("games", { 
	transform: function(doc) { return new RedScareGame(doc); }
});

var RedScareGame = function(doc) {
	_.extend(this, doc);
};
_.extend(RedScareGame.prototype, {
	isAbandoned: function() {
		return !!this.dateAbandoned;
	},
	containsRole: function(role) {
		return _.some(this.roles, function(r) { return r === role.id; });
	},
	getSetupConstants: function() {
		return Game.constants.presets[this.playerCount];
	},
	getRound: function(roundNum) {
		return this.rounds && this.rounds[roundNum];
	},
	getNomination: function(roundNum, nominationNum) {
		var round = this.getRound(roundNum);
		return round && round.nominations && round.nominations[nominationNum];
	},
	getCurrentNominationNumber: function() {
		var round = this.getRound(this.currentRound);
		return round && round.currentNominationNumber;
	},
	getCurrentRoundSize: function() {
		var round = this.getRound(this.currentRound);
		return round.nomineeCount;
	},
	isCurrentNominationReady: function() {
		var round = this.getRound(this.currentRound),
			nomination = round && round.nominations
				&& round.nominations[round.currentNominationNumber];
		return nomination && nomination.nominees
			&& (round.nomineeCount === nomination.nominees.length);
	},
	getCurrentLeader: function() {
		var nomination = this.getNomination(this.currentRound, this.getCurrentNominationNumber());
		return nomination && nomination.leader;
	},
	waitingForPlayers: function() {
		return !this.currentRound;
	},
	isCurrentUserLeader: function() {
		return this.getCurrentLeader() == Meteor.userId();
	},
	isCurrentNominationVoting: function() {
		if (this.isCurrentNominationReady()) {
			var round = this.getRound(this.currentRound);
			var votes = round.nominations[round.currentNominationNumber].votes;
			return votes && (Object.keys(votes).length < this.playerCount);
		}
		return false;
	},
	hasCurrentUserVoted: function() {
		var round = this.getRound(this.currentRound);
		var votes = round.nominations[round.currentNominationNumber].votes;
		return votes.hasOwnProperty(Meteor.userId());
	},
	isMissionHappening: function() {
		var round = this.getRound(this.currentRound);
		return round.nominations[round.currentNominationNumber].approved;
	},
	hasCurrentUserPassedOrFailed: function() {
		if (this.isMissionHappening()) {
			var round = this.getRound(this.currentRound);
			var isUserOnMission = round.mission.nominees.indexOf(Meteor.userId()) > -1;
			var hasUserVoted = round.mission.votes.hasOwnProperty(Meteor.userId());
			return isUserOnMission && hasUserVoted;
		}
		return false;
	},
	isAssassinationAttempt: function() {
		return (this.passedRoundsCount == 3 && this.containsRole(Game.constants.roles.merlin))
	},
	isCurrentUserAssassin: function() {
		// return Meteor.userId() == this.assassination.player;

		// JJ TEMP: return true for development purposes
		return true;
	},

	getUsersWhoAreResistance: function() {
		// JJ TODO: CHECK IF THE GAME IS OVER AND THE CURRENT USER IS THE ASSASSIN FIRST
		// return this.players.filter(function(p){
		// 	return (this.playerRoles[p] == ROLES.NORMAL_GOOD) ||
		// 		(this.playerRoles[p] == ROLES.MERLIN) ||
		// 		(this.playerRoles[p] == ROLES.PERCIVAL);
		// }, this);
	}
});

var game = {
	// Setup information
	name: "Randolph Towers Game Night",
	dateCreated: '2014-11-11 00:00:00',
	dateAbandoned: null,
	creator: 348579892,
	playerCount: 6,
	roles: [1,1,2,2,2,3],
	// Filled in as soon as game begins
	players: [238472394, 234985728, 2093842980 /* and 3 more*/],
	playerRoles: { 
		"238472394": 1,
		"234985728": 2,
		"2093842980": 2
		/* and 3 more */
	},
	// Updated as time progresses
	status: Game.constants.gameStatus.waitingForPlayers,
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
	if (Games.find().count() === 0) {
		Meteor.startup(function() {
			Games.insert({
				name: "Dustin's Foggy Bottom Game Night - waiting for nominations",
				dateCreated: '2014-11-20 00:00:00',
				creator: null,
				playerCount: 6,
				roles: [1,1,1,1,4,4],
				players: [1,2,3,4,5,6],
				status: Game.constants.gameStatus.nominating,
				currentRound: 1,
				rounds: {
					1: {
						nomineeCount: 2,
						currentNominationNumber: 1,
						nominations: {
							1: {
								leader: "AfKNADoWLcNhmdjgv",
								nominees: [238472394]
							}
						}
					}
				}
			});
			Games.insert({
				name: "Dustin's Foggy Bottom Game Night - waiting for votes",
				dateCreated: '2014-11-20 00:00:00',
				creator: null,
				playerCount: 6,
				roles: [1,1,1,1,4,4],
				players: [1,2,3,4,5,6],
				status: Game.constants.gameStatus.nominationVoting,
				currentRound: 1,
				rounds: {
					1: {
						nomineeCount: 2,
						currentNominationNumber: 1,
						nominations: {
							1: {
								leader: "AfKNADoWLcNhmdjgv",
								nominees: [238472394, 3543598],
								votes: {
									"238472394": true,
									"234985728": false,
									"2093842980": false
								},
								approved: false
							}
						}
					}
				}
			});
			Games.insert({
				name: "Dustin's Foggy Bottom Game Night - mission happening",
				dateCreated: '2014-11-20 00:00:00',
				creator: null,
				playerCount: 6,
				roles: [1,1,1,1,4,4],
				players: [1,2,3,4,5,6],
				status: Game.constants.gameStatus.missionVoting,
				currentRound: 1,
				rounds: {
					1: {
						nomineeCount: 2,
						currentNominationNumber: 1,
						nominations: {
							1: {
								leader: "AfKNADoWLcNhmdjgv",
								nominees: [238472394, 3543598],
								votes: {
									"238472394": true,
									"234985728": true,
									"2093842980": true,
									"209384230": true,
									"2093842": true,
									"2093": true
								},
								approved: true
							}
						},
						mission: {
							nominationNumber: 1,
							nominees: [238472394, 3543598],
							votes: {}
						}
					}
				}
			});	
			Games.insert({
				name: "Dustin's Foggy Bottom Game Night - assassination",
				dateCreated: '2014-11-20 00:00:00',
				creator: null,
				playerCount: 6,
				roles: [1,1,1,1,2,4],
				players: [1,2,3,4,5,6],
				status: Game.constants.gameStatus.assassination,
				playerRoles: {1: 1, 2: 1, 3: 1, 4: 1, 5:2, 6:4},
				currentRound: 1,
				passedRoundsCount: 3,
				rounds: {
					1: {
						nomineeCount: 2,
						currentNominationNumber: 1,
						nominations: {
							1: {
								leader: "AfKNADoWLcNhmdjgv",
								nominees: [238472394, 3543598],
								votes: {}
							}
						}
					},
					assassination: {player: "AfKNADoWLcNhmdjgv"}
				}
			});
		});
	}
}