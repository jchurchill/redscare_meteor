RedScare.NamespaceManager.enum(
	"Constants",
	"roles",
	{
		normalGood: 1,
		merlin: 2,
		percival: 3,
		normalEvil: 4,
		assassin: 5,
		morgana: 6,
		oberon: 7,
		mordred: 8
	}
);

Meteor.startup(function() {

var Constants = RedScare.Constants;
var roles = Constants.roles;
var alegs = Constants.allegiance;

var Role = function(props) {
	_.extend(this, props);
};
_.extend(Role.prototype, {
	isGood: function() { return this.allegiance === alegs.good; },
	isEvil: function() { return this.allegiance === alegs.evil; },
});

var roleDetails = [
	new Role({
		id: roles.normalGood,
		allegiance: alegs.good,
		mustAppearWith: [],
		unique: false,
		sees: []
	}),
	new Role({
		id: roles.merlin,
		allegiance: alegs.good,
		mustAppearWith: [roles.assassin],
		unique: true,
		sees: [roles.normalEvil, roles.assassin, roles.morgana, roles.oberon]
	}),
	new Role({
		id: roles.percival,
		allegiance: alegs.good,
		mustAppearWith: [roles.morgana, roles.merlin, roles.assassin],
		unique: true,
		sees: [roles.merlin, roles.morgana]
	}),
	new Role({
		id: roles.normalEvil,
		allegiance: alegs.evil,
		mustAppearWith: [],
		unique: false,
		sees: [roles.normalEvil, roles.assassin, roles.morgana, roles.mordred]
	}),
	new Role({
		id: roles.assassin,
		allegiance: alegs.evil,
		mustAppearWith: [roles.merlin],
		unique: true,
		sees: [roles.normalEvil, roles.assassin, roles.morgana, roles.mordred]
	}),
	new Role({
		id: roles.morgana,
		allegiance: alegs.evil,
		mustAppearWith: [roles.percival, roles.merlin, roles.assassin],
		unique: true,
		sees: [roles.normalEvil, roles.assassin, roles.morgana, roles.mordred]
	}),
	new Role({
		id: roles.oberon,
		allegiance: alegs.evil,
		mustAppearWith: [],
		unique: true,
		sees: []
	}),
	new Role({
		id: roles.mordred,
		allegiance: alegs.evil,
		mustAppearWith: [roles.merlin, roles.assassin],
		unique: true,
		sees: [roles.normalEvil, roles.assassin, roles.morgana, roles.mordred]
	})
];

Constants.add("roleDetails", Object.freeze(_.indexBy(roleDetails, _.property("id"))));

});
