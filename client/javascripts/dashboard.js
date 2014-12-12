Meteor.startup(function() {
// Usings
var Collections = RedScare.Collections;

Template.dashboard.helpers({
	games: function () {
		return Collections.Games.find({
			dateAbandoned: { $exists: false }
		}, {
			sort: [["dateCreated", "desc"]]
		}).fetch();
	}
});

});