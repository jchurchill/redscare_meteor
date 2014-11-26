SESSION = Session.namespace("players-joining");
SESSION.keys = {

};

Template.playersJoining.helpers({
	currentlyJoinedPlayers: function() {
		return Meteor.users.find(
			{
				_id: { $in: this.players }
			},
			{
				fields: { username: 1 }
			}).fetch();
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
	}
});

Template.playersJoining.events({
	"click .join-game-button": function() {
		// TODO: validate
		Games.update(this._id, {
			$push: { players: Meteor.userId() }
		})
	},
	"click .leave-game-button": function() {
		// TODO: validate
		Games.update(this._id, {
			$pull: { players: Meteor.userId() }
		})
	},
	// TODO: move this button to the game template - it's relevant at ALL times,
	// TODO: not just when players are joining
	"click .abandon-game-button": function() {
		// TODO: use jquery dialog or something
		if(confirm("Are you sure?")) {
			Meteor.call("abandonGame",
				this._id,
				function() {
					Router.go("home");
				});
		}
	}
});

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