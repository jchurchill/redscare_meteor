// Constants
var SESSION_PREFIX = "LoginOrSignup.";
var SIGNUP_PREFIX = SESSION_PREFIX + "signup.";
var LOGIN_PREFIX = SESSION_PREFIX + "login."

var SIGNUP_ERRORS = SIGNUP_PREFIX + "errors";
var LOGIN_ERRORS = LOGIN_PREFIX + "errors";

Meteor.startup(function() {
	Session.set(SIGNUP_ERRORS, {});
	Session.set(LOGIN_ERRORS, {});
});

// Template setup
Template.loginOrSignup.helpers({
	signupErrors: function() {
		return Session.get(SIGNUP_ERRORS);
	},
	loginErrors: function() {
		return Session.get(LOGIN_ERRORS);
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
				errors = Session.get(LOGIN_ERRORS)[fieldname],
				tooltip = errors.join("<br>");
			// "this" is the element that has the tooltip
			return tooltip;
		},
		position: {
			my: "left",
			at: "right+15"
		}
	});

	$(".signup-form .error-symbol").tooltip({
		content: function() {
			var fieldname = $(this).parent("div").attr("data-fieldname");
				errors = Session.get(SIGNUP_ERRORS)[fieldname],
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
				Session.set(SIGNUP_ERRORS, {});
			}
		});
	}
};
var setSignupErrors = function(error) {
	if (error && error.length !== 'undefined' && (typeof error !== 'string')) {
		// error is a list of error reasons
		var errors = _.chain(error)
			.map(function(er) { return SIGNUP_ERROR_REASONS[er]; })
			.groupByAndMap("type", function(reas) { return reas.msg; })
			.value();
		Session.set(SIGNUP_ERRORS, errors);
	}
	else if (typeof error === 'string') {
		// error is just a simple message
		Session.set(SIGNUP_ERRORS, { general: error });
	}
	else {
		Session.set(SIGNUP_ERRORS, { general: "An unknown error occurred." });
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
				Session.set(LOGIN_ERRORS, {});
			}
		});
	}
};
var setLoginErrors = function(error) {
	if (error && error.length !== 'undefined' && (typeof error !== 'string')) {
		// error is a list of error reasons
		var errors = _.chain(error)
			.map(function(er) { return LOGIN_ERROR_REASONS[er]; })
			.groupByAndMap("type", function(reas) { return reas.msg; })
			.value();
		Session.set(LOGIN_ERRORS, errors);
	}
	else if (typeof error === 'string') {
		// error is just a simple message
		Session.set(LOGIN_ERRORS, { general: error });
	}
	else {
		Session.set(LOGIN_ERRORS, { general: "An unknown error occurred." });
	}
};

var clearAllErrors = function() {
	Session.set(LOGIN_ERRORS, {});
	Session.set(SIGNUP_ERRORS, {});
};