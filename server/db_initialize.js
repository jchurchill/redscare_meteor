Meteor.startup(function() {

/* Ten users for testing
 * Their username is test{X}, where X in 1 - 11
 * Their password is equal to their username
 * Their email is their username @test.com */
var Users = Meteor.users;
if (Users.find().count() === 0) {
	_.each(_.range(1,12), function(i) {
		Accounts.createUser({
			username: "test" + i,
			email: "test" + i + "@test.com",
			password: "test" + i
		});
	});
}

});