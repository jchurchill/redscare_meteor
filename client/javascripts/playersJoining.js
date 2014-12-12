Meteor.startup(function() {

var GameSetupController = MeteorController.namespace("game_setup");
var TransitionUtilities = RedScare.Services.TransitionUtilities;
var TemplateSession = Session.namespace("playersJoining");

Template.playersJoining.helpers({
	currentlyJoinedPlayers: function() {
		var sortOrder = _.chain(this.players)
			.invert()
			.mapProperties(function(i) { return parseInt(i,10); })
			.value();
		var players = Meteor.users.find(
			{
				_id: { $in: this.players }
			},
			{
				fields: { username: 1 }
			}).fetch();
		// Sort returned players in the same order that they are stored in the game doc
		return _.sortBy(players, function(p) { return sortOrder[p._id]; });
	},
	isCurrentUserJoined: function() {
		return helpers.isCurrentUserJoined(this);
	},
	isCurrentUserGameCreator: function() {
		return helpers.isCurrentUserGameCreator(this);
	},
	canJoinGame: function() {
		return helpers.canJoinGame(this);
	},
	canLeaveGame: function() {
		return helpers.canLeaveGame(this);	
	},
	gameStarting: function() {
		return this.pendingTransition("gameStart") != null;
	},
	secondsUntilTransition: function() {
		return TemplateSession.get("secondsUntilTransition");
	}
});

Template.playersJoining.events({
	"click .join-game-button": function() {
		GameSetupController.call("addPlayer", this._id, Meteor.userId());
	},
	"click .leave-game-button": function() {
		GameSetupController.call("removePlayer", this._id, Meteor.userId());
	},
	// TODO: move this button to the game template - it's relevant at ALL times,
	// TODO: not just when players are joining
	"click .abandon-game-button": function() {
		// TODO: use jquery dialog or something
		if(confirm("Are you sure?")) {
			GameSetupController.call("abandon", this._id);
		}
	}
});

// Setup a timer that counts down to the game beginning once the last player has joined
// This function runs on every change to the game, calculating whether or not it should
// clear any currently ongoing countdowns, and if it should start a new countdown
Template.playersJoining.created = function() {
	TransitionUtilities.setupTransitionCountdown(
		/* template */ this,
		/* intervalMs */ 1000,
		/* getTransition */ function(dc) { return dc.pendingTransition("gameStart"); },
		/* countdownIntervalFn */ function(remainingMs) {
			var remainingSeconds = Math.floor(remainingMs / 1000);
			TemplateSession.set("secondsUntilTransition", remainingSeconds);
		});
};

var helpers = {};
helpers.isCurrentUserJoined = function(game) {
	return _.contains(game.players, Meteor.userId());
};
helpers.isCurrentUserGameCreator = function(game) {
	return game.creator === Meteor.userId();
};
helpers.canJoinGame = function(game) {
	return game.players.length < game.playerCount
		&& !game.isAbandoned()
		&& !helpers.isCurrentUserJoined(game);
};
helpers.canLeaveGame = function(game) {
	return !game.isAbandoned()
		&& helpers.isCurrentUserJoined(game)
		&& !helpers.isCurrentUserGameCreator(game);
};

});