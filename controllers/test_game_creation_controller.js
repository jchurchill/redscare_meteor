Meteor.startup(function() {

var TestGameCreationController = MeteorController.namespace("test_game_creation");
var Collections = RedScare.Collections;
// TODO: get rid of this and testing_helpers.* someday,
// as this currently lets you insert whatever junk you want into the games collection.
TestGameCreationController.methods({
	insert: function(doc) {
		Collections.Games.insert(doc);
	}	
});

});