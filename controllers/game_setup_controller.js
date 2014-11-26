var Controller = MeteorController.namespace("game_setup");

// TODO: Something to consider - what if validation reads stale state? Here's an example:
// TODO: two players want to join a game when there is one spot left. There is a call to
// TODO: a Meteor.methods endpoint (or maybe a direct update - would they act differently?),
// TODO: and because the methods run in parallel (I think?), they both see that they got
// TODO: the spot, and both get to join, leading to an invalid state. This begs a more
// TODO: general question - how do you do atomic database updates with meteor+mongo?
// TODO: Probably something I could look up on stack overflow once I'm not on a bus to NYC

Controller.methods({
	abandon: function(gameId) {
		var game = Games.findOne(gameId, {
			fields: { creator: 1 }
		});
		if (!game) {
			throw new Meteor.Error(403, "Game not found");
		}
		// Check that the current user is the creator of the game
		if (Meteor.userId() !== game.creator) {
			throw new Meteor.Error(403, "User who is not game creator cannot abandon it.");
		}
		Games.update(gameId, {
			$set: { dateAbandoned: new Date() }
		});
	},

	addPlayer: function(gameId, userId) {
		var game = Games.findOne(gameId, {
			fields: { players: 1, playerCount: 1 }
		});
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error(403, "Cannot add a player other than yourself to a game.");
		}
		if (game.players.length >= game.playerCount) {
			throw new Meteor.Error(403, "Cannot add a player to a game at full capacity.");
		}
		if (_.contains(game.players, userId)) {
			throw new Meteor.Error(403, "Cannot add a player to a game he is already in.");
		}
		Games.update(gameId, {
			$push: { players: userId }
		});
	},

	removePlayer: function(gameId, userId) {
		var game = Games.findOne(gameId, {
			fields: { creator: 1 }
		});
		if (!game) {
			throw new Meteor.Error(403, "Game not found");
		}
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error(403, "Cannot remove a player other than yourself from a game.");
		}
		if (userId === game.creator) {
			throw new Meteor.Error(403, "The creator of a game cannot leave it.");
		}
		// TODO validation: don't allow removal of player from in-progress game
		Games.update(gameId, {
			$pull: { players: userId }
		})
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};