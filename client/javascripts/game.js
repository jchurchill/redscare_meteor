Meteor.startup(function() {
// Usings
var Users = Meteor.users;
var Status = RedScare.Constants.gameStatus;

// Constants
var STARTED_STATES = [
	Status.nominating,
	Status.nominationVoting,
	Status.missionVoting,
	Status.assassination,
	Status.gameOver
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
			case Status.abandoned:
				return "abandoned";
			case Status.waitingForPlayers:
				return "playersJoining";
			case Status.starting:
				return "starting";
			case Status.nominating:
				return "nomination";
			case Status.nominationVoting:
				return "voting";
			case Status.missionVoting:
				return "mission";
			case Status.assassination:
				return "assassination";
			case Status.gameOver:
				return "gameOver";
			default:
				throw "Game status unrecognized: " + this.status;
		}
	}
});

});