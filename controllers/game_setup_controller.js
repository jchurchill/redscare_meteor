Meteor.startup(function() {
// Usings
var Games = RedScare.Collections.Games;
var Status = RedScare.Constants.gameStatus;
var GameStateManager = RedScare.Services.GameStateManager;
var Controller = MeteorController.namespace("game_setup");

Controller.methods({
	abandon: function(gameId) {
		_private.throwIfNotLoggedIn();
		GameStateManager.abandonGame(gameId, Meteor.userId());
	},

	addPlayer: function(gameId, userId) {
		var afterAddPlayer, afterGameMarkedReady;

		_private.throwIfNotLoggedIn();
		_private.throwIfNotCurrentUser(userId);

		// After adding a player to the game, mark the game as "Ready to begin"
		// if conditions correct (room is full, etc)
		afterAddPlayer = function() {
			GameStateManager.tryMarkGameAsReady(gameId, afterGameMarkedReady);
		};

		// After the game is marked as ready, wait some amount of time,
		// then transition state to begin game
		afterGameMarkedReady = function() {
			if (Meteor.isServer) {
				Meteor.setTimeout(function() {
					GameStateManager.beginGame(gameId);
				}, _private.countdownToGameStartMs);
			}
		};

		GameStateManager.addPlayerToGame(gameId, userId, afterAddPlayer);
	},

	removePlayer: function(gameId, userId) {
		_private.throwIfNotLoggedIn();
		_private.throwIfNotCurrentUser(userId);

		GameStateManager.removePlayerFromGame(gameId, userId);
	},

	markPlayerAsReadyToBeginRounds: function(gameId, userId) {
		var afterPlayerMarkedReady;

		_private.throwIfNotLoggedIn();
		_private.throwIfNotCurrentUser(userId);

		// After marking a player as ready, move the game onto the first round
		// if all players are now ready (checked automatically by setupNewRound)
		afterPlayerMarkedReady = function() {
			GameStateManager.setupNewRound(gameId, 1);
		};

		GameStateManager.markAsSeenSecretInfo(gameId, userId, afterPlayerMarkedReady);
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};

// TODO: if front end wants access to this to setup some kind
// TODO: of countdown, make this more accessible
_private.countdownToGameStartMs = 5000;

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