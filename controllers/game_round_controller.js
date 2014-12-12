Meteor.startup(function() {
// Usings
var Collections = RedScare.Collections;
var Controller = MeteorController.namespace("game_round");

Controller.methods({
	
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};
_private.beginNextRound = function(gameId) {
	var game = Collections.Games.findOne(gameId);
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