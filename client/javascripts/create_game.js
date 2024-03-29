Meteor.startup(function() {
// Usings
var Constants = RedScare.Constants;

var ROLE_OPTIONS = {
	MERLIN_ASSASSIN: {
		name: "merlin-assassin",
		good: 1,
		evil: 1,
		roles: [Constants.roles.merlin, Constants.roles.assassin]
	},
	PERCIVAL_MORGANA: {
		name: "percival-morgana",
		good: 1,
		evil: 1,
		roles: [Constants.roles.percival, Constants.roles.morgana]
	},
	MORDRED: {
		name: "mordred",
		good: 0,
		evil: 1,
		roles: [Constants.roles.mordred]
	},
	OBERON: {
		name: "oberon",
		good: 0,
		evil: 1,
		roles: [Constants.roles.oberon]
	},
};
ROLE_OPTIONS.MERLIN_ASSASSIN.requires = [];
ROLE_OPTIONS.PERCIVAL_MORGANA.requires = [ROLE_OPTIONS.MERLIN_ASSASSIN];
ROLE_OPTIONS.MORDRED.requires = [ROLE_OPTIONS.MERLIN_ASSASSIN];
ROLE_OPTIONS.OBERON.requires = [];

var CREATE_GAME_SESSION = Session.namespace("create_game");
var SESSION_ROLE_OPTIONS_ALLOWED = CREATE_GAME_SESSION.namespace("role_options_allowed");
var CreateGameController = MeteorController.namespace("create_game");

Template.create_game.helpers({
	disableMerlinAssassin: function() {
		return !!SESSION_ROLE_OPTIONS_ALLOWED.get(ROLE_OPTIONS.MERLIN_ASSASSIN.name);
	},
	disablePercivalMorgana: function() {
		return !!SESSION_ROLE_OPTIONS_ALLOWED.get(ROLE_OPTIONS.PERCIVAL_MORGANA.name);
	},
	disableMordred: function() {
		return !!SESSION_ROLE_OPTIONS_ALLOWED.get(ROLE_OPTIONS.MORDRED.name);
	},
	disableOberon: function() {
		return !!SESSION_ROLE_OPTIONS_ALLOWED.get(ROLE_OPTIONS.OBERON.name);
	}
});

Template.create_game.events({
	"change input.role-option": function(e) {
		updateAllowedSpecialRoles();
	},
	"change #create-game-playercount": function(e) {
		resetAllRoles();	
	},
	"click button.create-game-submit" : function(e) {
		var name = $("#create-game-name").val();
		var playerCount = parseInt($("#create-game-playercount").val(), 10);
		var selectedRolesToInclude = _.chain(ROLE_OPTIONS)
			.filter(function(r) { return $(roleInputSelector(r)).is(":checked"); })
			.mapMany(_.property("roles"))
			.map(function(roleId) {
				var roleDetails = Constants.roleDetails[roleId];
				return {
					id: roleId,
					isGood: roleDetails.isGood(),
					isEvil: roleDetails.isEvil()
				};
			})
			.value();
		var numSelectedGoodRoles = _.filter(selectedRolesToInclude, _.property("isGood")).length;
		var numSelectedEvilRoles = _.filter(selectedRolesToInclude, _.property("isEvil")).length;
		var setup = Constants.presets[playerCount];
		var roleIds = [];
		var createdGameId;
		if (!setup) {
			return;
		}

		// Construct the final set of roles for the game - 
		// all special roles selected, filling in gaps with normal good/evil
		// based on specified player count
		roleIds = roleIds.concat(_.pluck(selectedRolesToInclude, "id"));
		_.times(setup.goods - numSelectedGoodRoles, function() {
			roleIds.push(Constants.roles.normalGood);
		});
		_.times(setup.evils - numSelectedEvilRoles, function() {
			roleIds.push(Constants.roles.normalEvil);
		});

		CreateGameController.call("create", {
			name: name,
			playerCount: playerCount,
			roles: roleIds
		}, function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				Router.go("game", { _id: result });
			}
		});
	}
});

Template.create_game.rendered = function() {
	// Set defaults when template first rendered
	resetAllRoles();
};

// TODO: clean up the below

var roleInputSelector = function(role_option) {
	return "#" + role_option.name;
};

var setAllowed = function(role_option, allowed) {
	if (allowed) {
		SESSION_ROLE_OPTIONS_ALLOWED.set(role_option.name, false);
	}
	else {
		SESSION_ROLE_OPTIONS_ALLOWED.set(role_option.name, true);
		$(roleInputSelector(role_option)).attr("checked", false);
	}
};

var resetAllRoles = function() {
	// Uncheck every role
	_.chain(ROLE_OPTIONS).values().each(function(role) {
		$(roleInputSelector(role)).attr("checked", false);
	});
	// Update given the new state
	updateAllowedSpecialRoles();
};

var updateAllowedSpecialRoles = function() {
	// Enable all role options to start out
	_.chain(ROLE_OPTIONS).values().each(function(roleOption) { setAllowed(roleOption, true); });
	// Disable any role options that depend on other role options that are not selected
	disableDependentRoles();
	// Disable any role options that cannot be enabled because enabling them requires more players 
	disableRolesPreventedByPlayerCount();
};

var disableDependentRoles = function() {
	var shouldDisable = _.memoize(function(role) {
		var isChecked = isRoleChecked(role);
		if (role.requires.length === 0) {
			// If no dependencies, should not disable
			return {
				isChecked: isChecked,
				shouldDisable: false
			};
		}
		return {
			isChecked: isChecked,
			shouldDisable: _.any(role.requires, function(r) {
				var d = shouldDisable(r);
				// Disable if dependency not checked, or if dependency should be disabled
				return !d.isChecked || d.shouldDisable;
			})
		};
	}, function(r) { return r.name; });
	_.each(ROLE_OPTIONS, function(r) {
		if (shouldDisable(r).shouldDisable) {
			setAllowed(r, false);
		}
	});
};

var disableRolesPreventedByPlayerCount = function() {
	var playerCount = $("select.player-count-select").val(),
		currentGoodCount = countSpecialGoodRolesSelected(),
		goodCountAllowed = Constants.presets[playerCount].goods,
		currentEvilCount = countSpecialEvilRolesSelected(),
		evilCountAllowed = Constants.presets[playerCount].evils,
		rolesToDisable = roleOptionsWhere(function(r) {
			return (r.good + currentGoodCount > goodCountAllowed) && !isRoleChecked(r);
		})
		.concat(roleOptionsWhere(function(r) {
			return (r.evil + currentEvilCount > evilCountAllowed) && !isRoleChecked(r);
		}));
	_.each(rolesToDisable, function(r) { setAllowed(r, false); });
};

var countSpecialGoodRolesSelected = function() {
	return _.chain(roleOptionsWhere(function(r) { return r.good > 0; }))
		.reduce(function(s, role) {
			var checked = isRoleChecked(role);
			return s + (checked ? role.good : 0);
		}, 0).value();
};

var countSpecialEvilRolesSelected = function() {
	return _.chain(roleOptionsWhere(function(r) { return r.evil > 0; }))
		.reduce(function(s, role) {
			var checked = isRoleChecked(role);
			return s + (checked ? role.evil : 0);
		}, 0).value();
};

var isRoleChecked = function(role) {
	return $(roleInputSelector(role)).is(":checked");
};

var roleOptionsWhere = function(predicateFn) {
	return _.chain(ROLE_OPTIONS).values().filter(predicateFn).value();
};

});