RedScare.NamespaceManager.define("Services.GameStateManager");

Meteor.startup(function() {
// Usings
var GameStateManager = RedScare.Services.GameStateManager;
var Games = RedScare.Collections.Games;
var Status = RedScare.Constants.gameStatus;
var Presets = RedScare.Constants.presets;

//////////////////////////////////////////////
// Public methods 
/////////////////////////////////////////////

GameStateManager.abandonGame = function(gameId, userId, successCallback) {
	var update = {
		$set: {
			dateAbandoned: Date.now()
		}
	};
	includeStatusUpdate(update, Status.abandoned);

	var condition = {
		_id: gameId,
		// Only the creator of the game is allowed to abandon it
		creator: userId
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};

GameStateManager.addPlayerToGame = function(gameId, userId, successCallback) {
	var update = {
		$push: { players: userId }
	};

	var condition = {
		_id: gameId,
		// Do not add a player to a game they're already in
		players: { $not: { $in: [userId] } },
		// Do not add a player to a game that is at full capacity
		$where: "this.players.length < this.playerCount",
		// Players cannot be added to an in-progress game
		status: Status.waitingForPlayers
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};

GameStateManager.removePlayerFromGame = function(gameId, userId, successCallback) {
	var update = {
		$pull: { players: userId },
		$set: { readyForTransition: false }
	};

	var condition = {
		_id: gameId,
		// The creator of a game cannot leave it
		creator: { $ne: userId },
		// Players cannot leave an in-progress game
		status: Status.waitingForPlayers
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};

GameStateManager.tryMarkGameAsReady = function(gameId, successCallback) {
	var update = {
		$set: { readyForTransition: true }
	};

	var condition = {
		_id: gameId,
		// Mark as ready only if status is still waitingForPlayers
		// and the game is at full capacity
		status: Status.waitingForPlayers,
		$where: "this.players.length === this.playerCount"
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};

GameStateManager.beginGame = function(gameId, successCallback) {
	var update = {
		$set: {
			rounds: {}
		}
	};
	includeStatusUpdate(update, Status.starting);

	var condition = {
		_id: gameId,
		// Begin only if status is still waitingForPlayers
		status: Status.waitingForPlayers,
		// and the game is at full capacity,
		$where: "this.players.length === this.playerCount",
		// and it is readyForTransition
		readyForTransition: true
	};

	Games.update(condition, update, callbackIfSuccessful(function() {
		// Now that we're safely in a state where players cannot be added or removed,
		// randomly set up the role assignments, and randomly assign the current leader
		prepareGame(gameId, successCallback);
	}));
};

GameStateManager.markAsSeenSecretInfo = function(gameId, userId, successCallback) {
	var update = {
		$push: { seenSecretInfo: userId }
	};

	var condition = {
		_id: gameId,
		// Do not mark a player as having seen secret info if they're already marked
		seenSecretInfo: { $not: { $in: [userId] } },
		// Only players in the game can be marked this way
		players: { $in: [userId] },
		// This can only happen during the "starting" phase of the game
		status: Status.starting
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};

GameStateManager.setupNewRound = function(gameId, roundNum, successCallback) {
	var game = Games.findOne(gameId, { fields: { playerCount: 1 } });
	var settings = Presets[game.playerCount].missions[roundNum];
	if (!settings) { return; } // No such round (i.e., roundNum not in 1-5)
	
	var round = {
		nomineeCount: settings.nominations,
		failsRequired: settings.requiredFails,
		currentNominationNumber: 0,
		nominations: {}
	};

	var updates = { $set: {} };
	updates.$set.currentRound = roundNum;
	updates.$set.status = Status.nominating;
	updates.$set["rounds." + roundNum] = round;

	var condition = {
		_id: gameId,
		// Setup new round only if:
		// The current round is one less than the new round num
		currentRound: roundNum - 1,
		$and: [
			// The previous round was complete
			{ $where: "this.currentRound === 0 || this.rounds[this.currentRound].complete" },
			// All players have seen their roles (really only applicable for round 1)
			{ $where: "this.seenSecretInfo.length === this.playerCount" }
		]
	};

	Games.update(condition, updates, callbackIfSuccessful(function() {
		GameStateManager.setupNextNomination(gameId, roundNum);
	}));

};

GameStateManager.setupNextNomination = function(gameId, roundNum, successCallback) {
	// need to read in the current nomination number
	var roundKey = "rounds." + roundNum;

	var fields = {
		fields: {
			roundKey: 1
		}
	};

	var currentRound = Games.findOne(gameId, fields);
	console.log("current round!!! ", currentRound);
	// // need to update currentNominationNumber 
	// game.rounds[currentRound].currentNominationNumber = nextNomNumber;
	
	// // the new nomination should look like this
	// game.rounds[currentRound].nominations[nextNom] = {
	// 	leader: ,
	// 	nominees: [],
	// 	votes: {}
	// }

	// var conditions = {
	// 	_id: gameId,

	// };

	// var updates = { $set: {} };
	// updates.$set.["rounds."+roundNum].currentNominationNumber
	// Games.update(condition, updates, callbackIfSuccessful(successCallback));
};

/////////////////////////////////
// Private methods
/////////////////////////////////

function prepareGame(gameId, successCallback) {
	var game = Games.findOne(gameId, { fields: { players: 1, roles: 1 } });
	var shuffledRoles = _.shuffle(game.roles);
	var roleAssignments = _.indexByAndMap(game.players, _.identity, function(user, i) {
		return shuffledRoles[i];
	});
	var currentLeader = game.players[_.random(0,game.players.length-1)];

	var update = {
		$set: {
			playerRoles: roleAssignments,
			currentLeader: currentLeader,
			currentRound: 0,
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: []
		}
	};

	var condition = {
		_id: gameId,
		// To be safe, only do this when the status is "starting",
		// meaning we have moved past the waitingForPlayers phase
		status: Status.starting
	};

	Games.update(condition, update, callbackIfSuccessful(successCallback));
};


// Call on an object representing the update rules in a mongo update
// to also include a status update as part of that update.
function includeStatusUpdate(update, status) {
	var statusUpd$set = {
		status: status,
		readyForTransition: false
	};
	var upd$set = update.$set || {};
	update.$set = _.extend(upd$set, statusUpd$set);
};

function callbackIfSuccessful(successCallback) {
	if (!successCallback) { return null; }
	return function(err, updated) {
		if (err || updated === 0) {
			return;
		}
		successCallback.call();
	};
}

});