Template.dashboard.helpers({
	games: function () {
		return Games.find({
			dateAbandoned: { $exists: false }
		}).fetch();
	}
});