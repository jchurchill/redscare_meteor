Meteor.startup(function() {

var GameSetupController = MeteorController.namespace("game_setup");
var TemplateSession = Session.namespace("playersJoining");
var Status = RedScare.Constants.gameStatus;

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
		return this._transition != null;
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
var countdownState = {};
Template.playersJoining.created = function() {
	this.autorun(function(c) {
		var game = Template.currentData();

		// If the game is not in a transitioning state, clear the outstanding
		// transition countdown if it exists, and don't do anything else
		if (!game._transition) {
			Meteor.clearInterval(countdownState.interval);
			return;
		}

		// If the currently registered transition is the same as
		// the game's transition, do nothing
		if (countdownState.id === game._transition.id) {
			return;
		}

		// Else, clear the current one, and set up a new one below
		Meteor.clearInterval(countdownState.interval);

		// Determine how many seconds remain until transition
		var msUntilTransition = (game._transition.date - Date.now()) / 1000;
		var secondsUntilTransition = Math.floor(Math.max(0, msUntilTransition));
		TemplateSession.set("secondsUntilTransition", secondsUntilTransition);

		// Every second, count down, stopping once 0 is reached
		function updateCountdown() {
			var secondsRemaining = TemplateSession.get("secondsUntilTransition") - 1;
			TemplateSession.set("secondsUntilTransition", secondsRemaining);
			if (secondsRemaining <= 0) {
				Meteor.clearInterval(countdownState.interval);
			}
		};

		countdownState = {
			id: game._transition.id,
			interval: Meteor.setInterval(updateCountdown, 1000)
		};
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