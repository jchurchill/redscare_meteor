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
		if (this.waitingForPlayers && this.waitingForPlayers()) {
			return "playersJoining";
		}
		if (this.isOver && this.isOver()) {
			return "gameOver";
		} 
		else {
			return "round";
		}
	}
});