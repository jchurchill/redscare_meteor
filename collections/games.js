Games = new Mongo.Collection("games");

// TODO: for testing only. delete this
if(Meteor.isServer) {
	Meteor.startup(function() {
		Games.insert({ name: "my game", players: [1,2,3] });
		Games.insert({ name: "my second game", status: "merlin got assassinated!!" });
	});
}