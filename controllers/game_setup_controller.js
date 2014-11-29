Meteor.startup(function() {
// Usings
var Games = RedScare.Collections.Games;
var Controller = MeteorController.namespace("game_setup");

Controller.methods({
	abandon: function(gameId) {
		_private.throwIfNotLoggedIn();
		var game = Games.findOne(gameId, {
			fields: { creator: 1 }
		});
		if (!game) {
			throw new Meteor.Error(403, "Game not found");
		}
		Games.update({
			_id: gameId,
			// Only the creator of the game is allowed to abandon it
			creator: Meteor.userId()
		}, {
			$set: {
				dateAbandoned: new Date(),
				status: RedScare.Constants.gameStatus.abandoned
			}
		});
	},

	addPlayer: function(gameId, userId) {
		_private.throwIfNotLoggedIn();
		_private.throwIfNotCurrentUser(userId);

		Games.update({
			_id: gameId,
			// Do not add a player to a game they're already in
			players: { $not: { $in: [userId] } },
			// Do not add a player to a game that is at full capacity
			$where: "this.players.length < this.playerCount",
			// Players cannot be added to an in-progress game
			status: RedScare.Constants.gameStatus.waitingForPlayers
		}, {
			$push: { players: userId }
		},
		function(err, updated) {
			if (err || updated === 0) { return; }
			_private.tryMarkGameAsReady(gameId, /* successCallback: */ function() {
				// Wait some amount of time, then transition state to begin game
				if (Meteor.isServer) {
					Meteor.setTimeout(function() {
						_private.beginGame(gameId);
					}, _private.countdownToGameStartMs);
				}
			});
		});
	},

	removePlayer: function(gameId, userId) {
		_private.throwIfNotLoggedIn();
		_private.throwIfNotCurrentUser(userId);

		Games.update({
			_id: gameId,
			// The creator of a game cannot leave it
			creator: { $ne: userId },
			// Players cannot leave an in-progress game
			status: RedScare.Constants.gameStatus.waitingForPlayers
		}, {
			$pull: { players: userId },
			$unset: { dateReadyToBegin: '' }
		});
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};
// TODO: if front end wants access to this to setup some kind
// TODO: of countdown, make this more accessible
_private.countdownToGameStartMs = 5000;
_private.tryMarkGameAsReady = function(gameId, successCallback) {
	Games.update({
		_id: gameId,
		// Mark as ready only if status is still waitingForPlayers
		// and the game is at full capacity
		status: RedScare.Constants.gameStatus.waitingForPlayers,
		$where: "this.players.length === this.playerCount"
	}, {
		$set: { dateReadyToBegin: new Date() }
	}, function(err, updated) {
		if (err || updated === 0) { return; }
		(successCallback || function(){}).call(null);
	});
};
_private.beginGame = function(gameId) {
	Games.update({
		_id: gameId,
		// Begin only if status is still waitingForPlayers
		// and the game is at full capacity,
		// and the dateReadyToBegin is set
		status: RedScare.Constants.gameStatus.waitingForPlayers,
		$where: "this.players.length === this.playerCount",
		dateReadyToBegin: { $exists: true }
	}, {
		$set: {
			status: RedScare.Constants.gameStatus.nominating
		}
	});
};
_private.throwIfNotLoggedIn = function() {
	if (!Meteor.userId()) {
		throw new Meteor.Error(403, "Must be logged in to do this operation");
	}
};
_private.throwIfNotCurrentUser = function(userId) {
	if (userId !== Meteor.userId()) {
		throw new Meteor.Error(403, "The user is not permissioned to do this operation.");
	}
};

});