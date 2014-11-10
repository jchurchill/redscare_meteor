// Account validation
Accounts.validateNewUser(function(user) {
	var username = user.username,
		// User creation can only happen with exactly one email address
		email = user.emails && user.emails[0] && user.emails[0].address,
		validEmailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		errorReasons = [];
	
	if (!username || username.length === 0) {
		errorReasons.push(1);
	}	
	if (!email || email.length === 0) {
		errorReasons.push(2);
	}
	if (email && !validEmailRegex.test(email)) {
		errorReasons.push(3);
	}

	if (errorReasons.length === 0) {
		return true;
	}
	throw new Meteor.Error(403, errorReasons);
});