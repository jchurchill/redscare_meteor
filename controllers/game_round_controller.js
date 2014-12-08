Meteor.startup(function() {
// Usings
var Games = RedScare.Collections.Games;
var Controller = MeteorController.namespace("game_round");
var GameStateManager = RedScare.Services.GameStateManager;

Controller.methods({
	nominateUser: function(userId, leaderId) {
		console.log("leader", leaderId," is nominating this user: ", userId);
		// don't let it go through if the leaderId doesnt match the Game's currentLeader
		// GameStateManager.setupNextNomination("EyKf7WD7rBbvCjqjk", 1);
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};
_private.beginNextRound = function(gameId) {
	var game = Games.findOne(gameId);
	// TODO
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