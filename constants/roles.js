// Constants.roles
RedScare.NamespaceManager.define("Constants", {
	roles: Object.freeze({
		normalGood: 1,
		merlin: 2,
		percival: 3,
		normalEvil: 4,
		assassin: 5,
		morgana: 6,
		oberon: 7,
		mordred: 8
	})
});

// Constants.roleDetails
Meteor.startup(function() {

var roles = RedScare.Constants.roles;
var alegs = RedScare.Constants.allegiance;

var Role = function(props) {
	this.allegiance = props.allegiance;
	this.unique = props.unique;
	this.mustAppearWith = props.mustAppearWith;
};
_.extend(Role.prototype, {
	isGood: function() { return this.allegiance === ALLEGIANCE.GOOD; },
	isEvil: function() { return this.allegiance === ALLEGIANCE.EVIL; },
});

RedScare.NamespaceManager.define("Constants", {
	roleDetails: Object.freeze({
		1 /* normalGood */: new Role({
			allegiance: alegs.good,
			mustAppearWith: [],
			unique: false
		}),
		2 /* merlin */: new Role({
			allegiance: alegs.good,
			mustAppearWith: [roles.assassin],
			unique: true
		}),
		3 /* percival */: new Role({
			allegiance: alegs.good,
			mustAppearWith: [roles.morgana, roles.merlin, roles.assassin],
			unique: true
		}),
		4 /* normalEvil */: new Role({
			allegiance: alegs.evil,
			mustAppearWith: [],
			unique: false
		}),
		5 /* assassin */: new Role({
			allegiance: alegs.evil,
			mustAppearWith: [roles.merlin],
			unique: true
		}),
		6 /* morgana */: new Role({
			allegiance: alegs.evil,
			mustAppearWith: [roles.percival, roles.merlin, roles.assassin],
			unique: true
		}),
		7 /* oberon */: new Role({
			allegiance: alegs.evil,
			mustAppearWith: [],
			unique: true
		}),
		8 /* mordred */: new Role({
			allegiance: alegs.evil,
			mustAppearWith: [roles.merlin, roles.assassin],
			unique: true
		}),
	})
});
});
