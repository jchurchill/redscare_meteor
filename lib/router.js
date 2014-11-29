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
		data: function () {
			return RedScare.Collections.Games.findOne({_id: this.params._id});
		}
	});

	// TODO: for testing only - remove
	this.route("animation_test", {
		path: "/animation_test",
		template: "animation_test"
	});
});