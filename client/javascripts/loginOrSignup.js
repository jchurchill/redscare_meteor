Meteor.startup(function() {

// Constants
var SESSION = {
	LOCAL: Session.namespace("login-or-signup")
};
SESSION.signup = SESSION.LOCAL.namespace("signup");
SESSION.login = SESSION.LOCAL.namespace("login");
SESSION.keys = {
	errors: "errors"
};


SESSION.signup.setDefault(SESSION.keys.errors, {});
SESSION.login.setDefault(SESSION.keys.errors, {});


// Template setup
Template.loginOrSignup.helpers({
	signupErrors: function() {
		return SESSION.signup.get(SESSION.keys.errors);
	},
	loginErrors: function() {
		return SESSION.login.get(SESSION.keys.errors);
	}
});

// When enter is pressed with focus on a signup or login field,
// take corresponding action
// Additionally, setup respective buttons to take same actions
Template.loginOrSignup.events({
	"click button.signup-button": function(e) { signup(e); },
	"keypress .signup-field": function(e) {
		if (e.which === 13) {
			signup(e);
		}
	},
	"click button.login-button": function(e) { login(e); },
	"keypress .login-field": function(e) {
		if (e.which === 13) {
			login(e);
		}
	}
});

// Error tooltips
Template.loginOrSignup.rendered = function() {
	$(".login-form .error-symbol").tooltip({
		content: function() {
			var fieldname = $(this).parent("div").attr("data-fieldname");
				errors = SESSION.login.get(SESSION.keys.errors)[fieldname],
				tooltip = errors.join("<br>");
			// "this" is the element that has the tooltip
			return tooltip;
		},
		position: {
			my: "left",
			at: "right+5"
		}
	});

	$(".signup-form .error-symbol").tooltip({
		content: function() {
			var fieldname = $(this).parent("div").attr("data-fieldname");
				errors = SESSION.signup.get(SESSION.keys.errors)[fieldname],
				tooltip = errors.join("<br>");
			// "this" is the element that has the tooltip
			return tooltip;
		},
		position: {
			my: "left",
			at: "right+5"
		}
	});
};


// Helpers
var SIGNUP_ERROR_REASONS = {
	1: { type: "username", msg: "A username is required." },
	2: { type: "email", msg: "An email is required." },
	3: { type: "email", msg: "Invalid email." },
	4: { type: "password", msg: "A password is required." }
};
var signup = function(event) {
	var username = $('#signup-username input')[0].value.trim(),
		email = $('#signup-email input')[0].value.trim(),
		password = $('#signup-password input')[0].value,
		options = { username: username, email: email, password: password },
		errors = [];

	clearAllErrors();

	if (!username || username.length === 0) {
		errors.push(1); // Missing username
	}
	if (!email || email.length === 0) {
		errors.push(2); // Missing email
	}
	if (!password || password.length === 0) {
		errors.push(4); // Missing password
	}

	if (errors.length > 0) {
		setSignupErrors(errors);
	}
	else {
		Accounts.createUser(options, function (error) {
			if (error) {
				setSignupErrors(error.reason);
			} else {
				SESSION.signup.set(SESSION.keys.errors, {});
			}
		});
	}
};
var setSignupErrors = function(error) {
	var setSessionErrors, errors;

	setSessionErrors = function(err) {
		SESSION.signup.set(SESSION.keys.errors, err);
	};

	if (error && error.length !== 'undefined' && (typeof error !== 'string')) {
		// error is a list of error reasons, or just a single error reason
		var errors = _.chain([].concat(error))
			.map(function(er) { return SIGNUP_ERROR_REASONS[er]; })
			.groupByAndMap("type", function(reas) { return reas.msg; })
			.value();
		setSessionErrors(errors);
	}
	else if (typeof error === 'string') {
		// error is just a simple message
		setSessionErrors({ general: error });
	}
	else {
		setSessionErrors({ general: "An unknown error occurred." });
	}
};


var LOGIN_ERROR_REASONS = {
	1: { type: "usernameOrEmail", msg: "Please enter your username or your email." },
	2: { type: "usernameOrEmail", msg: "Username or email does not exist." },
	3: { type: "password", msg: "Please enter a password." },
	4: { type: "password", msg: "Password incorrect." }
};
var login = function(event) {
	var usernameOrEmail = $('#login-username-or-email input')[0].value.trim(),
		password = $('#login-password input')[0].value,
		errors = [];
	
	clearAllErrors();

	if (!usernameOrEmail || usernameOrEmail.length === 0) {
		errors.push(1); // Missing username or email
	}
	if (!password || password.length === 0) {
		errors.push(3); // Missing password
	}

	if (errors.length > 0) {
		setLoginErrors(errors);
	}
	else {
		Meteor.loginWithPassword(usernameOrEmail, password, function(error){
			if (error) {
				setLoginErrors(error.reason);
			} else {
				SESSION.login.set(SESSION.keys.errors, {});
			}
		});
	}
};
var setLoginErrors = function(error) {
	var setSessionErrors, errors;

	setSessionErrors = function(err) {
		SESSION.login.set(SESSION.keys.errors, err);
	};

	if (error && error.length !== 'undefined' && (typeof error !== 'string')) {
		// error is a list of error reasons, or just a single error reason
		var errors = _.chain([].concat(error))
			.map(function(er) { return LOGIN_ERROR_REASONS[er]; })
			.groupByAndMap("type", function(reas) { return reas.msg; })
			.value();
		setSessionErrors(errors);
	}
	else if (typeof error === 'string') {
		// error is just a simple message
		setSessionErrors({ general: error });
	}
	else {
		setSessionErrors({ general: "An unknown error occurred." });
	}
};

var clearAllErrors = function() {
	SESSION.signup.set(SESSION.keys.errors, {});
	SESSION.login.set(SESSION.keys.errors, {});
};

});