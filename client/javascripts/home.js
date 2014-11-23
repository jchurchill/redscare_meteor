Template.home.helpers({
	templateToRender: function() {
		if (Meteor.userId()) {
			return "dashboard";
		}
		else {
			return "loginHome";
		}
	}
});