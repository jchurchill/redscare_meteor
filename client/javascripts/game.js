Meteor.startup(function() {
// Usings
var Users = Meteor.users;
var Constants = RedScare.Constants;

// Constants
var STARTED_STATES = [
	Constants.gameStatus.nominating,
	Constants.gameStatus.nominationVoting,
	Constants.gameStatus.missionVoting,
	Constants.gameStatus.assassination,
	Constants.gameStatus.gameOver
];

Template.game.helpers({
	owningUser: function() {
		return Users.findOne(this.creator);
	},
	gameStarted: function() {
		return _.contains(STARTED_STATES, this.status);
	},
	templateToRender: function() {
		// TODO: fix this by using iron-router's waitFor property in defining the route
		// for some reason when refreshing the page, THIS is an empty object {},
		// then the page is reloaded and THIS becomes the Game object.
		// So initially, none of the Game methods exist
		// Thus, the reason for this.method && this.method(), so we wont keep getting "undefined is not a function"
		switch (this.status) {
			case Constants.gameStatus.abandoned:
				return "abandoned";
			case Constants.gameStatus.waitingForPlayers:
				return "playersJoining";
			case Constants.gameStatus.starting:
				return "starting";
			case Constants.gameStatus.nominating:
				return "nomination";
			case Constants.gameStatus.nominationVoting:
				return "voting";
			case Constants.gameStatus.missionVoting:
				return "mission";
			case Constants.gameStatus.assassination:
				return "assassination";
			case Constants.gameStatus.gameOver:
				return "gameOver";
			default:
				throw "Game status unrecognized: " + this.status;
		}
	}
});

});