Meteor.startup(function() {
// Usings
var Games = RedScare.Collections.Games;

Template.dashboard.helpers({
	games: function () {
		return Games.find({
			dateAbandoned: { $exists: false }
		}, {
			sort: [["dateCreated", "desc"]]
		}).fetch();
	}
});

});