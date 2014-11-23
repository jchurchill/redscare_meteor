GAME_PRESETS = {
	5: { 
		evils: 2,
		goods: 3,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 2, requiredFails: 1 },
			4: { nominations: 3, requiredFails: 1 },
			5: { nominations: 3, requiredFails: 1 }
		}
	},
	6: {
		evils: 2,
		goods: 4,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 3, requiredFails: 1 },
			5: { nominations: 4, requiredFails: 1 }
		}
	},
	7: {
		evils: 3,
		goods: 4,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 3, requiredFails: 1 },
			4: { nominations: 4, requiredFails: 2 },
			5: { nominations: 4, requiredFails: 1 }
		}
	},
	8: {
		evils: 3,
		goods: 5,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	},
	9: {
		evils: 3,
		goods: 6,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	},
	10: {
		evils: 4,
		goods: 6,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	}
};

OUTCOMES = {
	CANCELLED: -1,
	GOOD_WINS: 1,
	EVIL_WINS_FROM_FAILS: 2,
	EVIL_WINS_FROM_ASSASSINATION: 3,
	EVIL_WINS_FROM_DOWNVOTES: 4
};

ALLEGIANCE = {
	GOOD: 1,
	EVIL: 2
};

Role = function(id, props) {
	this.id = id;
	this.allegiance = props.allegiance;
	this.unique = props.unique;
	this.mustAppearWith = [];
};
_.extend(Role.prototype, {
	isGood: function() { return this.allegiance === ALLEGIANCE.GOOD; },
	isEvil: function() { return this.allegiance === ALLEGIANCE.EVIL; },
});

ROLES = {
	NORMAL_GOOD: new Role(1, { allegiance: ALLEGIANCE.GOOD, unique: false }),
	MERLIN: new Role(2, { allegiance: ALLEGIANCE.GOOD, unique: true }),
	PERCIVAL: new Role(3, { allegiance: ALLEGIANCE.GOOD, unique: true }),
	NORMAL_EVIL: new Role(4, { allegiance: ALLEGIANCE.EVIL, unique: false }),
	ASSASSIN: new Role(5, { allegiance: ALLEGIANCE.EVIL, unique: true }),
	MORGANA: new Role(6, { allegiance: ALLEGIANCE.EVIL, unique: true }),
	OBERON: new Role(7, { allegiance: ALLEGIANCE.EVIL, unique: true }),
	MORDRED: new Role(8, { allegiance: ALLEGIANCE.EVIL, unique: true }),
	getRoleIdMap: function() {
		return _.chain(ROLES).indexBy(_.property("id")).value();
	}
};
// *** Role dependencies ***
// This set is NOT recursively defined; a role must list all of its dependencies, not just immediate ones
// This makes life easier elsewhere, and is reasonable here since this set of information is small
ROLES.NORMAL_GOOD.mustAppearWith = [];
ROLES.MERLIN.mustAppearWith = [ROLES.ASSASSIN.id];
ROLES.PERCIVAL.mustAppearWith = [ROLES.MORGANA.id,ROLES.MERLIN.id,ROLES.ASSASSIN.id];
ROLES.NORMAL_EVIL.mustAppearWith = [];
ROLES.ASSASSIN.mustAppearWith = [ROLES.MERLIN.id];
ROLES.MORGANA.mustAppearWith = [ROLES.PERCIVAL.id,ROLES.MERLIN.id,ROLES.ASSASSIN.id];
ROLES.OBERON.mustAppearWith = [];
ROLES.MORDRED.mustAppearWith = [ROLES.MERLIN.id, ROLES.ASSASSIN.id];
