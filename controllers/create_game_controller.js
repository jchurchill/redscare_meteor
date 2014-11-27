var Controller = MeteorController.namespace("create_game");

Controller.methods({
	create: function(doc) {
		if (!this.userId) {
			throw new Meteor.Error("logged-out", "The user must be logged in to create a game.");
		}
		check(doc, {
			name: Match.Where(function(n) {
				// Name must be non-empty string
				check(n,String);
				return n.length > 0;
			}),
			playerCount: Match.Where(function(c) {
				// playerCount must be part of a valid setup
				check(c,Match.Integer);
				return CONSTANTS.gamePresets.hasOwnProperty(c);
			}),
			roles: Match.Where(function(rs) {
				// roles must be array of ints, with length equal to playerCount,
				// and must satisfy rules of game setup
				check(rs,[Match.Integer]);
				return _private.roleSetValid(rs, doc.playerCount);
			})
		});

		// Set some defaults
		doc.dateCreated = new Date();
		doc.creator = this.userId;
		doc.players = [this.userId];
		// Games are always created with status waiting for players
		doc.status = CONSTANTS.gameStatus.waitingForPlayers;

		// Insert, return new _id
		return Games.insert(doc);
	}
});

//////////////////////////////////////
// Private methods referenced above //
//////////////////////////////////////
var _private = {};
_private.roleSetValid = function(roleIds, playerCount) {
	// roleIds must be a list of int ids
	if (!roleIds || typeof roleIds.length !== "number") {
		return false;
	}
	// The number of roles must correspond to a valid number of players
	var setup = CONSTANTS.gamePresets[roleIds.length];
	if (!setup) {
		return false;
	}
	// The number of roles must equal the specified player count
	if (!(roleIds.length === playerCount)) {
		return false;
	}
	// The number of good and evil roles must match with the game setup requirements
	var roleIdMap = CONSTANTS.roles.getRoleIdMap(),
		roles = _.map(roleIds, function(r) { return roleIdMap[r]; }),
		allegianceCounts = _.chain(roles)
			.groupBy("allegiance")
			.mapProperties("length")
			.value(),
		numGoods = allegianceCounts[CONSTANTS.allegiance.good] || 0,
		numEvils = allegianceCounts[CONSTANTS.allegiance.evil] || 0;
	// All roles must be recognized - this is true if #evils + #goods = all roles
	if (!((numGoods + numEvils) === roleIds.length)) {
		return false;
	}
	// Verify with game setup requirements
	if (!(numGoods === setup.goods && numEvils === setup.evils)) {
		return false;
	}
	// Verify that all role dependencies are satisfied
	var roleDependenciesSatisfied = function(role, roleIdSet) {
		var requiredRoleIds = role.mustAppearWith;
		return _.intersection(requiredRoleIds, roleIdSet).length === requiredRoleIds.length;
	};
	if(!_.all(roles, function(role) { return roleDependenciesSatisfied(role, roleIds); })) {
		return false;
	}
	// Finally, verify that no special role appears more than once
	var duplicateSpecialRoles = _.chain(roles)
		.filter(_.property("unique"))
		.groupBy("id")
		.mapProperties("length")
		.any(function(c) { return c > 1; })
		.value();
	if (duplicateSpecialRoles) {
		return false;
	}
	return true;
};