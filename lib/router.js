Router.map(function() {
	this.route("home", {
		path: "/"
	});
	this.route("create_game", {
		path: "/new",
		template: "create_game"
	});
	this.route("game", {
		path: "/games/:_id",
		data: function () { return Games.findOne({_id: this.params._id}) }
	});
});