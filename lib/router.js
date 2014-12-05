// Use the layout template as the layout for every page.
Router.configure({
	layoutTemplate: "layout"
});

// For all routes, perform this check before following the route:
// If the user is not logged in, redirect to home
Router.onBeforeAction(function () {
	var redirectPath = "home";
	if (!Meteor.userId()) {
		var currentPath = this.location.get().path;
		if (currentPath === Router.path(redirectPath)) {
			this.next();
		}
		this.redirect(redirectPath);
	} else {
		this.next();
	}
});

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
		path: "/animation_test"
	});
});