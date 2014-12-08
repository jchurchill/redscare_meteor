var SESSION = Session.namespace("nomination");
SESSION.keys = {};
var GameRoundController = MeteorController.namespace("game_round");
var Users = Meteor.users;

Template.nomination.helpers({
	isCurrentUserLeader: function() {
		return this.currentLeader == Meteor.userId();
	},
	getPlayers: function() {
		return helpers.playerUsers(this.players);
	},
	getNominationOptionAttributes: function(userId) {
		var game = Template.parentData(1);
		var currentRound = game.rounds[game.currentRound]; //.nominations;
		// var currentNominationNumber = currentRound.currentNominationNumber;
		// var nominations = currentRound.nominations[currentNominationNumber].nominees;

		// console.log(currentRound);
		// if (_.contains(nominations, userId)) {
		// 	return {
		// 		class: "nomination-option nominated"	
		// 	};
		// } 
		// else {
		// 	return {
		// 		class: "nomination-option"	
		// 	}
		// }
	}
});

Template.nomination.events({
	"click .nomination-option": function(e) {
		console.log("leader has clicked this option: ", this);
		GameRoundController.call("nominateUser", this._id, Meteor.userId());
	}
});

var helpers = {};

helpers.playerUsers = function(playerIds) {
	if (!playerIds || playerIds.length === 0) {
		return [];
	}
	return Users.find(
			{ _id: { $in: playerIds } },
			{ fields: { _id: 1, username: 1 }}
		).fetch();
};