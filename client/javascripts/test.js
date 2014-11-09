Template.test.helpers({
	name: function() {
		var user = Meteor.user();
		return (user && user.username) || "world";
	},
	indexUrl: Router.path("index")
});