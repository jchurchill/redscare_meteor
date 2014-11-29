Meteor.startup(function() {
// Usings
var Status = RedScare.Constants.gameStatus;

Template.starting.helpers({
	settingUpGame: function() {
		// Intentional double-equals catches null or undefined, but not 0
		return this.currentRound == null;
	}
});


});