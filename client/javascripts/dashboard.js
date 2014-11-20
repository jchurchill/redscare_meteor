Template.dashboard.helpers({
	games: function () {
		return Games.find().fetch();
	},
	jsonify: function(obj) {
		return JSON.stringify(obj);
	}
});