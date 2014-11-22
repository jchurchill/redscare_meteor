Router.map(function() {
	this.route("home", {
		path: "/"
	});

	this.route("test",{
		path: "justinisthebest"
	});

	this.route("game", {
		path: "/games/:_id",
		data: function () { return Games.findOne({_id: this.params._id}) }
	});
});