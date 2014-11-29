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
	Games.update({
		_id: gameId,
		// Only the creator of the game is allowed to abandon it
		creator: userId
	}, {
		$set: {
			dateAbandoned: new Date(),
			status: Status.abandoned
		}
	},
	callbackIfSuccessful(successCallback));
};

GameStateManager.addPlayerToGame = function(gameId, userId, successCallback) {
	Games.update({
		_id: gameId,
		// Do not add a player to a game they're already in
		players: { $not: { $in: [userId] } },
		// Do not add a player to a game that is at full capacity
		$where: "this.players.length < this.playerCount",
		// Players cannot be added to an in-progress game
		status: Status.waitingForPlayers
	}, {
		$push: { players: userId }
	},
	callbackIfSuccessful(successCallback));
};

GameStateManager.removePlayerFromGame = function(gameId, userId, successCallback) {
	Games.update({
		_id: gameId,
		// The creator of a game cannot leave it
		creator: { $ne: userId },
		// Players cannot leave an in-progress game
		status: Status.waitingForPlayers
	}, {
		$pull: { players: userId },
		$unset: { dateReadyToBegin: '' }
	},
	callbackIfSuccessful(successCallback));
};

GameStateManager.tryMarkGameAsReady = function(gameId, successCallback) {
	Games.update({
		_id: gameId,
		// Mark as ready only if status is still waitingForPlayers
		// and the game is at full capacity
		status: Status.waitingForPlayers,
		$where: "this.players.length === this.playerCount"
	}, {
		$set: { dateReadyToBegin: new Date() }
	},
	callbackIfSuccessful(successCallback));
};

GameStateManager.beginGame = function(gameId, successCallback) {
	Games.update({
		_id: gameId,
		// Begin only if status is still waitingForPlayers
		// and the game is at full capacity,
		// and the dateReadyToBegin is set
		status: Status.waitingForPlayers,
		$where: "this.players.length === this.playerCount",
		dateReadyToBegin: { $exists: true }
	}, {
		$set: {
			status: Status.starting
		}
	},
	function (err, updated) {
		if (err || updated === 0) { return; }
		// Now that we're safely in a state where players cannot be added or removed,
		// randomly set up the role assignments, and randomly assign the current leader
		prepareGame(gameId, successCallback);
	});
};

GameStateManager.setupNewRound = function(gameId, roundNum, successCallback) {
	var game = Games.findOne(gameId, { fields: { playerCount: 1 } });
	var settings = Presets[game.playerCount].missions[roundNum];
	if (!settings) { return; } // No such round (i.e., roundNum not in 1-5)
	
	var round = {
		nomineeCount: settings.nominations,
		currentNominationNumber: 0
	};

	var updates = {};
	updates.currentRound = roundNum;
	updates["rounds." + roundNum] = round;
	
	Games.update({
		_id: gameId,
		// Setup new round only if:
		// The current round is one less than the new round num
		currentRound: roundNum - 1,
		// The previous round was complete
		$where: "this.currentRound === 0 || this.rounds[this.currentRound].complete"
	},
	updates,
	callbackIfSuccessful(successCallback));
}

/////////////////////////////////
// Private methods
/////////////////////////////////

function prepareGame(gameId, successCallback) {
	var game = Games.findOne(gameId, { fields: { players: 1, roles: 1 } });
	var shuffledRoles = _.shuffle(game.roles);
	var roleAssignments = _.indexByAndMap(players, _.identity, function(user, i) {
		return shuffledRoles[i];
	});
	var currentLeader = game.players[_.random(0,game.players.length-1)];
	Games.update({
		_id: gameId,
		// To be safe, only do this when the status is "starting",
		// meaning we have moved past the waitingForPlayers phase
		status: Status.starting
	}, {
		$set: {
			playerRoles: roleAssignments,
			currentLeader: currentLeader,
			currentRound: 0
		}
	},
	callbackIfSuccessful(successCallback));
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