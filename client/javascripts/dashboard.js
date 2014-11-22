Template.dashboard.helpers({
	games: function () {
		return Games.find().fetch();
	}
});