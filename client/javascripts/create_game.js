ROLE_OPTIONS = {
	MERLIN_ASSASSIN: {
		name: "merlin-assassin",
		good: 1,
		evil: 1,
		roles: [ROLES.MERLIN, ROLES.ASSASSIN]
	},
	PERCIVAL_MORGANA: {
		name: "percival-morgana",
		good: 1,
		evil: 1,
		roles: [ROLES.PERCIVAL, ROLES.MORGANA]
	},
	MORDRED: {
		name: "mordred",
		good: 0,
		evil: 1,
		roles: [ROLES.MORDRED]
	},
	OBERON: {
		name: "oberon",
		good: 0,
		evil: 1,
		roles: [ROLES.OBERON]
	},
};
ROLE_OPTIONS.MERLIN_ASSASSIN.requires = [];
ROLE_OPTIONS.PERCIVAL_MORGANA.requires = [ROLE_OPTIONS.MERLIN_ASSASSIN];
ROLE_OPTIONS.MORDRED.requires = [ROLE_OPTIONS.MERLIN_ASSASSIN];
ROLE_OPTIONS.OBERON.requires = [];

SESSION_PREFIX = "create_game";
DOT = ".";
SESSION_KEYS = {
	ALLOWED: SESSION_PREFIX + DOT + "allowed"
};
ROLE_OPTIONS.MERLIN_ASSASSIN.isDisabledSessionKey =
	SESSION_KEYS.ALLOWED + DOT + ROLE_OPTIONS.MERLIN_ASSASSIN.name;
ROLE_OPTIONS.PERCIVAL_MORGANA.isDisabledSessionKey =
	SESSION_KEYS.ALLOWED + DOT + ROLE_OPTIONS.PERCIVAL_MORGANA.name;
ROLE_OPTIONS.MORDRED.isDisabledSessionKey =
	SESSION_KEYS.ALLOWED + DOT + ROLE_OPTIONS.MORDRED.name;
ROLE_OPTIONS.OBERON.isDisabledSessionKey =
	SESSION_KEYS.ALLOWED + DOT + ROLE_OPTIONS.OBERON.name;

Template.create_game.helpers({
	disableMerlinAssassin: function() {
		return !!Session.get(ROLE_OPTIONS.MERLIN_ASSASSIN.isDisabledSessionKey);
	},
	disablePercivalMorgana: function() {
		return !!Session.get(ROLE_OPTIONS.PERCIVAL_MORGANA.isDisabledSessionKey);
	},
	disableMordred: function() {
		return !!Session.get(ROLE_OPTIONS.MORDRED.isDisabledSessionKey);
	},
	disableOberon: function() {
		return !!Session.get(ROLE_OPTIONS.OBERON.isDisabledSessionKey);
	}
});

Template.create_game.events({
	"change input.role-option": function(e) {
		updateAllowedSpecialRoles();
	},
	"change select.player-count-select": function(e) {
		resetAllRoles();	
	},
	"button.create-game-submit" : function(e) {
		console.log("submit", e);
	}
});

Template.create_game.rendered = function() {
	// Set defaults when template first rendered
	resetAllRoles();
};

// TODO: clean up the below

var roleInputSelector = function(role_option) {
	return "input[name='" + role_option.name + "']";
};

var setAllowed = function(role_option, allowed) {
	var isDisabled = role_option.isDisabledSessionKey;
	if (allowed) {
		Session.set(isDisabled, false);
	}
	else {
		Session.set(isDisabled, true);
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
	// Enable all roles to start out
	_.chain(ROLE_OPTIONS).values().each(function(role) { setAllowed(role, true); });
	// Disable any roles that depend on other roles that are not selected
	disableDependentRoles();
	// Disable any roles that cannot be enabled because enabling them requires more players 
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
		goodCountAllowed = GAME_PRESETS[playerCount].goods,
		currentEvilCount = countSpecialEvilRolesSelected(),
		evilCountAllowed = GAME_PRESETS[playerCount].evils,
		rolesToDisable = rolesWhere(function(r) {
			return (r.good + currentGoodCount > goodCountAllowed) && !isRoleChecked(r);
		})
		.concat(rolesWhere(function(r) {
			return (r.evil + currentEvilCount > evilCountAllowed) && !isRoleChecked(r);
		}));
	_.each(rolesToDisable, function(r) { setAllowed(r, false); });
};

var countSpecialGoodRolesSelected = function() {
	return _.chain(rolesWhere(function(r) { return r.good > 0; }))
		.reduce(function(s, role) {
			var checked = isRoleChecked(role);
			return s + (checked ? role.good : 0);
		}, 0).value();
};

var countSpecialEvilRolesSelected = function() {
	return _.chain(rolesWhere(function(r) { return r.evil > 0; }))
		.reduce(function(s, role) {
			var checked = isRoleChecked(role);
			return s + (checked ? role.evil : 0);
		}, 0).value();
};

var isRoleChecked = function(role) {
	return $(roleInputSelector(role)).is(":checked");
};

var rolesWhere = function(predicateFn) {
	return _.chain(ROLE_OPTIONS).values().filter(predicateFn).value();
};