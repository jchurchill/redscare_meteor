RedScare.NamespaceManager.define("Services.GameStateManager");

Meteor.startup(function() {
// Usings
var GameStateManager = RedScare.Services.GameStateManager;
var TransitionUtilities = RedScare.Services.TransitionUtilities;
var Collections = RedScare.Collections;
var Constants = RedScare.Constants;

//////////////////////////////////////////////
// Public methods 
/////////////////////////////////////////////

GameStateManager.add("abandonGame", function(gameId, userId, successCallback) {
	var update = {
		$set: {
			dateAbandoned: new Date(),
			status: Constants.gameStatus.abandoned
		}
	};

	TransitionUtilities.haveUpdateCancelAllTransitions(update);

	var condition = {
		_id: gameId,
		// Only the creator of the game is allowed to abandon it
		creator: userId
	};

	Collections.Games.update(condition, update, callbackIfSuccessful(successCallback));
});

GameStateManager.add("addPlayerToGame", function(gameId, userId, successCallback) {
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
		status: Constants.gameStatus.waitingForPlayers
	};

	Collections.Games.update(condition, update, callbackIfSuccessful(successCallback));
});

GameStateManager.add("removePlayerFromGame", function(gameId, userId, successCallback) {
	var update = {
		$pull: { players: userId }
	};

	TransitionUtilities.haveUpdateCancelTransitions(["gameStart"], update);

	var condition = {
		_id: gameId,
		// The creator of a game cannot leave it
		creator: { $ne: userId },
		// Players cannot leave an in-progress game
		status: Constants.gameStatus.waitingForPlayers
	};

	Collections.Games.update(condition, update, callbackIfSuccessful(successCallback));
});

GameStateManager.add("beginGameIfReady", function(gameId, delayMs, successCallback) {
	var update = {
		$set: {
			status: Constants.gameStatus.starting,
			rounds: {}
		}
	};

	var condition = {
		_id: gameId,
		// Begin only if status is still waitingForPlayers
		status: Constants.gameStatus.waitingForPlayers,
		// and the game is at full capacity,
		$where: "this.players.length === this.playerCount",
	};

	Collections.Games.delayedUpdate("gameStart", delayMs, condition, update, callbackIfSuccessful(function() {
		// Now that we're safely in a state where players cannot be added or removed,
		// randomly set up the role assignments, and randomly assign the current leader
		prepareGame(gameId, successCallback);
	}));
});

GameStateManager.add("markAsSeenSecretInfo", function(gameId, userId, successCallback) {
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
		status: Constants.gameStatus.starting
	};

	Collections.Games.update(condition, update, callbackIfSuccessful(successCallback));
});

GameStateManager.add("setupNewRound", function(gameId, roundNum, delayMs, successCallback) {
	var game = Collections.Games.findOne(gameId, { fields: { playerCount: 1 } });
	var settings = Constants.presets[game.playerCount].missions[roundNum];
	if (!settings) { throw "No such round: " + roundNum; } // (i.e., roundNum not in 1-5)
	
	var round = {
		nomineeCount: settings.nominations,
		failsRequired: settings.requiredFails,
		currentNominationNumber: 0
	};

	var updates = { $set: {} };
	updates.$set.currentRound = roundNum;
	updates.$set.status = Constants.gameStatus.nominating;
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

	Collections.Games.delayedUpdate("roundStart", delayMs, condition, updates, callbackIfSuccessful(successCallback));
});

/////////////////////////////////
// Private methods
/////////////////////////////////

function prepareGame(gameId, successCallback) {
	var game = Collections.Games.findOne(gameId, { fields: { players: 1, roles: 1 } });
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
		status: Constants.gameStatus.starting
	};

	Collections.Games.update(condition, update, callbackIfSuccessful(successCallback));
};

function callbackIfSuccessful(successCallback) {
	if (!successCallback) { return null; }
	return function(err, updated) {
		if (err || updated === 0) {
			return;
		}
		successCallback.call();
	};
};

});