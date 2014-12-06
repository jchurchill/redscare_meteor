Meteor.startup(function() {
// Usings
var Users = Meteor.users;
var Constants = RedScare.Constants;
var Status = Constants.gameStatus;
var Roles = Constants.roles;
var GameSetupController = MeteorController.namespace("game_setup");

var ROLE_TEMPLATE_NAMES = {};
ROLE_TEMPLATE_NAMES[Roles.normalGood] = "starting_normalGood";
ROLE_TEMPLATE_NAMES[Roles.merlin] = "starting_merlin";
ROLE_TEMPLATE_NAMES[Roles.percival] = "starting_percival";
ROLE_TEMPLATE_NAMES[Roles.normalEvil] = "starting_normalEvil";
ROLE_TEMPLATE_NAMES[Roles.assassin] = "starting_assassin";
ROLE_TEMPLATE_NAMES[Roles.morgana] = "starting_morgana";
ROLE_TEMPLATE_NAMES[Roles.oberon] = "starting_oberon";
ROLE_TEMPLATE_NAMES[Roles.mordred] = "starting_mordred";

Template.starting.helpers({
	settingUpGame: function() {
		// Intentional double-equals catches null or undefined, but not 0
		return this.currentRound == null;
	},
	isPlayerInGame: function() {
		return _.contains(this.players, Meteor.userId());
	},
	roleSpecificTemplate: function() {
		var userId = Meteor.userId();
		var roleId = this.playerRoles[userId];
		return ROLE_TEMPLATE_NAMES[roleId] || "starting_notInGame";
	},
	isReadyToMoveOn: function() {
		return _.contains(this.seenSecretInfo, Meteor.userId());
	},
	playerWaitingStatuses: function() {
		var playerUsers = helpers.playerUsers(this.players);
		var playerIdsReady = this.seenSecretInfo;
		return _.map(playerUsers, function(user) {
			return {
				user: user,
				isReady: _.contains(playerIdsReady, user._id)
			};
		});
	}
});

Template.starting.events({
	"click button.ready-starting-game": function(e) {
		var gameId = this._id;
		var userId = Meteor.userId();
		GameSetupController.call("markPlayerAsReadyToBeginRounds", gameId, userId);
	}
});

// Add the following helpers to all role-specific templates
_.each(ROLE_TEMPLATE_NAMES, function(templateName) {
	Template[templateName].helpers({
		gameIncludesRole: function(roleName) {
			var roleId = Roles[roleName];
			return this.containsRole(roleId);
		},
		revealedPlayers: function() {
			var currentUserId = Meteor.userId();
			var userRoleId = this.playerRoles[currentUserId];
			var revealedRoleIds = Constants.roleDetails[userRoleId].sees;
			var revealedUserIds = _.reduce(this.playerRoles, function(memo, roleId, userId) {
				if (_.contains(revealedRoleIds, roleId) && userId !== currentUserId) {
					memo.push(userId);
				}
				return memo;
			}, []);
			return helpers.playerUsers(revealedUserIds);
		}
	});
});

var helpers = {};
helpers.playerUsers = function(playerIds) {
	if (!playerIds || playerIds.length === 0) {
		return [];
	}
	return Users.find(
			{ _id: { $in: playerIds } },
			{ fields: { _id: 1, username: 1 }}
		).fetch();
};

});