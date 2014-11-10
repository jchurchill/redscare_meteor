// Constants
var SESSION_PREFIX = "Signup.";
var ERRORS = SESSION_PREFIX + "errors";

// Template setup
Template.signup.helpers({
	errors: function() {
		return Session.get(ERRORS);
	}
});

Template.signup.events({
	"click button": function(e) { signup(e); },
	"keypress .signup-element": function(e) {
		if (e.which === 13) {
			signup(e);
		}
	}
});


// Helpers
var signup = function(event) {
	var username = $('#signup-username input')[0].value.trim(),
		email = $('#signup-email input')[0].value.trim(),
		password = $('#signup-password input')[0].value,
		options = { username: username, email: email, password: password };

	Accounts.createUser(options, function (error) {
		if (error) {
			setErrors(error);
		} else {
			Session.set(ERRORS, {});
		}
	});
};

var ERROR_REASONS = {
	1: { type: "username", msg: "A username is required." },
	2: { type: "email", msg: "An email is required." },
	3: { type: "email", msg: "Invalid email." }
};
var ERROR_TYPES = {
	username: { id: "signup-username" },
	email: { id: "signup-email" },
	password: { id: "signup-password" }
}
var setErrors = function(error) {
	if (error.reason.length !== 'undefined' && (typeof error.reason !== 'string')) {
		// Error.reason is a list of error reasons
		var errors = _.chain(error.reason)
			.map(function(er) { return ERROR_REASONS[er]; })
			.groupByAndMap("type", function(reas) { return reas.msg; })
			.value();
		Session.set(ERRORS, errors);
	}
	else if (typeof error.reason === 'string') {
		// Error.reason is just a simple message
		Session.set(ERRORS, { general: error.reason });
	}
	else {
		Session.set(ERRORS, { general: "An unknown error occurred." });
	}
};

// Error tooltips
Template.signup.rendered = function() {
	$(".signup-form .error-symbol").tooltip({
		content: function() {
			var fieldname = $(this).parent("div").attr("data-fieldname");
				errors = Session.get(ERRORS)[fieldname],
				tooltip = errors.join("<br>");
			// "this" is the element that has the tooltip
			return tooltip;
		},
		position: {
			my: "left",
			at: "right+15"
		}
	});
};