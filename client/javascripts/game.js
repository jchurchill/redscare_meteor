Template.game.helpers({
	owningUser: function() {
		return Meteor.users.findOne(this.creator);
	},
	templateToRender: function() {
		// TODO: fix this by using iron-router's waitFor property in defining the route
		// for some reason when refreshing the page, THIS is an empty object {},
		// then the page is reloaded and THIS becomes the Game object.
		// So initially, none of the Game methods exist
		// Thus, the reason for this.method && this.method(), so we wont keep getting "undefined is not a function"
		switch (this.status) {
			case RedScare.Constants.gameStatus.abandoned:
				return "abandoned";
			case RedScare.Constants.gameStatus.waitingForPlayers:
				return "playersJoining";
			case RedScare.Constants.gameStatus.nominating:
				return "nomination";
			case RedScare.Constants.gameStatus.nominationVoting:
				return "voting";
			case RedScare.Constants.gameStatus.missionVoting:
				return "mission";
			case RedScare.Constants.gameStatus.assassination:
				return "assassination";
			case RedScare.Constants.gameStatus.gameOver:
				return "gameOver";
			default:
				throw "Game status unrecognized: " + this.status;
		}
	}
});