// Account validation
Accounts.validateNewUser(function(user) {
	var username = user.username,
		// User creation can only happen with exactly one email address
		email = user.emails && user.emails[0] && user.emails[0].address,
		validEmailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		errorReasons = [];
	
	// TODO: replace with enum from loginOrSignup.js
	if (!username || username.length === 0) {
		errorReasons.push(1 /* No username supplied */);
	}	
	if (!email || email.length === 0) {
		errorReasons.push(2 /* No email supplied */);
	}
	if (email && !validEmailRegex.test(email)) {
		errorReasons.push(3 /* Email not valid */);
	}

	if (errorReasons.length === 0) {
		return true;
	}
	throw new Meteor.Error(403, errorReasons);
});

Accounts.validateLoginAttempt(function(info) {
	if (info.allowed) {
		return true;
	}
	// Login attempt invalid; transform meteor's error reason into one we can consume more easily
	// Yes, we do string comparison here. There seems to be no better way to interface with these errors...
	if (info.error.reason === "Incorrect password") {
		throw new Meteor.Error(403, 4 /* Incorrect password */);
	}
	if (info.error.reason === "User not found") {
		throw new Meteor.Error(403, 2 /* User not found */);
	}
	throw new Meteor.Error(403, info.error.reason);
});