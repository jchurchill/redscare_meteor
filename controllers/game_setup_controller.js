var Controller = MeteorController.namespace("game_setup");

Controller.methods({
	abandon: function(gameId) {
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
		},
		{
			$set: { dateAbandoned: new Date() }
		});
	},

	addPlayer: function(gameId, userId) {
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error(403, "Cannot add a player other than yourself to a game.");
		}
		Games.update({
			_id: gameId,
			// Do not add a player to a game they're already in
			players: { $not: { $in: [userId] } },
			// Do not add a player to a game that is at full capacity
			$where: "this.players.length < this.playerCount"
		},
		{
			$push: { players: userId }
		});
	},

	removePlayer: function(gameId, userId) {
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error(403, "Cannot remove a player other than yourself from a game.");
		}
		// TODO validation: don't allow removal of player from in-progress game
		Games.update({
			_id: gameId,
			// The creator of a game cannot leave it
			creator: { $ne: userId }
		},
		{
			$pull: { players: userId }
		})
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};