var defineConstants = function(constants) {
	RedScare.NamespaceManager.define("Constants", constants);
};

//*************************************//
//*     RedScare.Constants.presets    *//
//*************************************//
defineConstants({
	presets: Object.freeze({
		5: Object.freeze({ 
			evils: 2,
			goods: 3,
			missions: {
				1: { nominations: 2, requiredFails: 1 },
				2: { nominations: 3, requiredFails: 1 },
				3: { nominations: 2, requiredFails: 1 },
				4: { nominations: 3, requiredFails: 1 },
				5: { nominations: 3, requiredFails: 1 }
			}
		}),
		6: Object.freeze({
			evils: 2,
			goods: 4,
			missions: {
				1: { nominations: 2, requiredFails: 1 },
				2: { nominations: 3, requiredFails: 1 },
				3: { nominations: 4, requiredFails: 1 },
				4: { nominations: 3, requiredFails: 1 },
				5: { nominations: 4, requiredFails: 1 }
			}
		}),
		7: Object.freeze({
			evils: 3,
			goods: 4,
			missions: {
				1: { nominations: 2, requiredFails: 1 },
				2: { nominations: 3, requiredFails: 1 },
				3: { nominations: 3, requiredFails: 1 },
				4: { nominations: 4, requiredFails: 2 },
				5: { nominations: 4, requiredFails: 1 }
			}
		}),
		8: Object.freeze({
			evils: 3,
			goods: 5,
			missions: {
				1: { nominations: 3, requiredFails: 1 },
				2: { nominations: 4, requiredFails: 1 },
				3: { nominations: 4, requiredFails: 1 },
				4: { nominations: 5, requiredFails: 2 },
				5: { nominations: 5, requiredFails: 1 }
			}
		}),
		9: Object.freeze({
			evils: 3,
			goods: 6,
			missions: {
				1: { nominations: 3, requiredFails: 1 },
				2: { nominations: 4, requiredFails: 1 },
				3: { nominations: 4, requiredFails: 1 },
				4: { nominations: 5, requiredFails: 2 },
				5: { nominations: 5, requiredFails: 1 }
			}
		}),
		10: Object.freeze({
			evils: 4,
			goods: 6,
			missions: {
				1: { nominations: 3, requiredFails: 1 },
				2: { nominations: 4, requiredFails: 1 },
				3: { nominations: 4, requiredFails: 1 },
				4: { nominations: 5, requiredFails: 2 },
				5: { nominations: 5, requiredFails: 1 }
			}
		})
	})
});

//*************************************//
//*    RedScare.Constants.outcomes    *//
//*************************************//
defineConstants({
	outcomes: Object.freeze({
		cancelled: -1,
		goodWins: 1,
		evilWinsFromFails: 2,
		evilWinsFromAssassination: 3,
		evilWinsFromDownvotes: 4
	})
});

//*************************************//
//*  RedScare.Constants.allegiance    *//
//*************************************//
defineConstants({
	allegiance: Object.freeze({
		good: 1,
		evil: 2
	})
});

//*************************************//
//*     RedScare.Constants.roles      *//
//*************************************//
(function() {
	var Role = function(id, props) {
		this.id = id;
		this.allegiance = props.allegiance;
		this.unique = props.unique;
		this.mustAppearWith = [];
	};
	_.extend(Role.prototype, {
		isGood: function() { return this.allegiance === ALLEGIANCE.GOOD; },
		isEvil: function() { return this.allegiance === ALLEGIANCE.EVIL; },
	});

	var a = RedScare.Constants.allegiance;
	defineConstants({
		roles: Object.freeze({
			normalGood: new Role(1, { allegiance: a.good, unique: false }),
			merlin: new Role(2, { allegiance: a.good, unique: true }),
			percival: new Role(3, { allegiance: a.good, unique: true }),
			normalEvil: new Role(4, { allegiance: a.evil, unique: false }),
			assassin: new Role(5, { allegiance: a.evil, unique: true }),
			morgana: new Role(6, { allegiance: a.evil, unique: true }),
			oberon: new Role(7, { allegiance: a.evil, unique: true }),
			mordred: new Role(8, { allegiance: a.evil, unique: true }),
			getRoleIdMap: function() {
				return _.chain(RedScare.Constants.roles).indexBy(_.property("id")).value();
			}
		})
	});
	// *** Role dependencies ***
	// This set is NOT recursively defined; a role must list all of its dependencies,
	// not just immediate ones. This makes life easier elsewhere, and is reasonable
	// here since this set of information is small
	var r = RedScare.Constants.roles;
	r.normalGood.mustAppearWith = [];
	r.merlin.mustAppearWith = [r.assassin.id];
	r.percival.mustAppearWith = [r.morgana.id, r.merlin.id, r.assassin.id];
	r.normalEvil.mustAppearWith = [];
	r.assassin.mustAppearWith = [r.merlin.id];
	r.morgana.mustAppearWith = [r.percival.id, r.merlin.id, r.assassin.id];
	r.oberon.mustAppearWith = [];
	r.mordred.mustAppearWith = [r.merlin.id, r.assassin.id];
})();

//*************************************//
//*  RedScare.Constants.gameStatus    *//
//*************************************//
defineConstants({
	gameStatus: Object.freeze({
		abandoned: -1,
		waitingForPlayers: 1,
		nominating: 2,
		nominationVoting: 3,
		missionVoting: 4,
		assassination: 5,
		gameOver: 6
	})
});