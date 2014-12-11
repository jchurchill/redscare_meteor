Meteor.startup(function(){

var Games = RedScare.Collections.Games;
var Roles = RedScare.Constants.roles;
var Status = RedScare.Constants.gameStatus;
var Users = Meteor.users;
var TestGameCreationController = MeteorController.namespace("test_game_creation");

var makeUserMapping = function(tuples) {
	return _.indexByAndMap(
		tuples,
		function(t) { return t[0]; },
		function(t) { return t[1]; });
};

var tenUsernames = [
	"test1", "test2", "test3", "test4", "test5",
	"test6", "test7", "test8", "test9", "test10"];
var tenRoles = [
	Roles.normalGood, Roles.normalGood, Roles.normalGood, Roles.normalGood, Roles.merlin, Roles.percival,
	Roles.assassin, Roles.morgana, Roles.oberon, Roles.mordred];

var getTenUsers = function() {
	return _.chain(
		Users.find(
			{ username: { $in: tenUsernames } },
			{ limit: 10, fields: { _id: 1, username: 1 } }
		).fetch()
	)
	.sortBy(function(u) { return parseInt(u.username.slice(4), 10); })
	.pluck("_id")
	.value();
};

// Construct some game setup common to all testing games

var getTenRoleAssignments = function(tenUsers) {
	return makeUserMapping([
		[tenUsers[0], Roles.merlin],
		[tenUsers[1], Roles.percival],
		[tenUsers[2], Roles.normalGood],
		[tenUsers[3], Roles.normalGood],
		[tenUsers[4], Roles.normalGood],
		[tenUsers[5], Roles.normalGood],
		[tenUsers[6], Roles.assassin],
		[tenUsers[7], Roles.morgana],
		[tenUsers[8], Roles.oberon],
		[tenUsers[9], Roles.mordred],
	]);
};

// Game creation possibilities
Template.testing_helpers.events({
	"click button.waiting-for-players": function() {
		var tenUsers = getTenUsers();
		// A 10-person game that's waiting for one more player
		TestGameCreationController.call("insert", {
			name: "[test] Waiting for players - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			players: tenUsers.slice(0,9),
			status: Status.waitingForPlayers
		});
	},
	"click button.revealing-roles": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game that has started and roles are being revealed to everyone
		// Everyone has confirmed they've seen the roles other than user test10
		TestGameCreationController.call("insert", {
			name: "[test] Revealing roles - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			playerRoles: tenRoleAssignments,
			players: tenUsers,
			status: Status.starting,
			currentRound: 0,
			currentLeader: tenUsers[0],
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers.slice(0,9)
		});
	},
	"click button.waiting-for-nomination": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game that just began and is now in the first nominating phase for round 1
		TestGameCreationController.call("insert", {
			name: "[test] Waiting for nomination - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			playerRoles: tenRoleAssignments,
			players: tenUsers,
			status: Status.nominating,
			currentRound: 1,
			currentLeader: tenUsers[0],
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers,
			rounds: {
				1: {
					nomineeCount: 3,
					failsRequired: 1,
					currentNominationNumber: 1
				}
			}
		});
	},
	"click button.waiting-for-nomination-votes": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game that just began, the leader has nominated the first set of people,
		// and players are now doing approval voting for it
		TestGameCreationController.call("insert", {
			name: "[test] Waiting for approval votes - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			players: tenUsers,
			playerRoles: tenRoleAssignments,
			status: Status.nominationVoting,
			currentRound: 1,
			currentLeader: tenUsers[0],
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers,
			rounds: {
				1: {
					nomineeCount: 3,
					failsRequired: 1,
					currentNominationNumber: 1,
					nominations: {
						1: {
							leader: tenUsers[0],
							nominees: [tenUsers[0], tenUsers[1], tenUsers[2]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], false],
								[tenUsers[2], true],
								[tenUsers[3], false],
								[tenUsers[4], true],
								[tenUsers[5], false],
								[tenUsers[6], true],
								[tenUsers[7], false],
								[tenUsers[8], true],
							])
						}
					}
				}
			}
		});
	},
	"click button.mission-happening": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game that had its first round first nomination get rejected,
		// but then its first round second nomination was approved
		// and the nominees are now going on a mission
		TestGameCreationController.call("insert", {
			name: "[test] Waiting for mission submit - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			players: tenUsers,
			playerRoles: tenRoleAssignments,
			status: Status.missionVoting,
			currentRound: 1,
			currentLeader: tenUsers[1],
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers,
			rounds: {
				1: {
					nomineeCount: 3,
					failsRequired: 1,
					currentNominationNumber: 1,
					nominations: {
						1: {
							leader: tenUsers[0],
							nominees: [tenUsers[0], tenUsers[1], tenUsers[2]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], false],
								[tenUsers[2], true],
								[tenUsers[3], false],
								[tenUsers[4], true],
								[tenUsers[5], false],
								[tenUsers[6], true],
								[tenUsers[7], true],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: false
						},
						2: {
							leader: tenUsers[1],
							nominees: [tenUsers[1], tenUsers[2], tenUsers[3]],
							votes: makeUserMapping([
								[tenUsers[0], false],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], true],
								[tenUsers[5], false],
								[tenUsers[6], true],
								[tenUsers[7], true],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: true
						},
					},
					mission: {
						nominationNum: 2,
						nominees: [tenUsers[1], tenUsers[2], tenUsers[3]],
						votes: makeUserMapping([
							[tenUsers[1], true],
							[tenUsers[2], true],
							// waiting on tenUsers[3] to vote
						]),
					}
				}
			}
		});
	},
	"click button.downvote-chicken": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game where on the first round no one approved any missions
		// so now the 5th nomination has been made and its downvote chicken time,
		// and the difference between pass and lose relies on only one final uncast vote
		TestGameCreationController.call("insert", {
			name: "[test] Downvote chicken - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			players: tenUsers,
			playerRoles: tenRoleAssignments,
			status: Status.nominationVoting,
			currentRound: 1,
			currentLeader: tenUsers[4],
			passedRoundsCount: 0,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers,
			rounds: {
				1: {
					nomineeCount: 3,
					failsRequired: 1,
					currentNominationNumber: 5,
					nominations: {
						1: {
							leader: tenUsers[0],
							nominees: [tenUsers[0], tenUsers[1], tenUsers[2]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], true],
								[tenUsers[2], false],
								[tenUsers[3], false],
								[tenUsers[4], false],
								[tenUsers[5], false],
								[tenUsers[6], false],
								[tenUsers[7], false],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: false
						},
						2: {
							leader: tenUsers[1],
							nominees: [tenUsers[1], tenUsers[2], tenUsers[3]],
							votes: makeUserMapping([
								[tenUsers[0], false],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], false],
								[tenUsers[4], false],
								[tenUsers[5], false],
								[tenUsers[6], false],
								[tenUsers[7], false],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: false
						},
						3: {
							leader: tenUsers[2],
							nominees: [tenUsers[2], tenUsers[3], tenUsers[4]],
							votes: makeUserMapping([
								[tenUsers[0], false],
								[tenUsers[1], false],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], false],
								[tenUsers[5], false],
								[tenUsers[6], false],
								[tenUsers[7], false],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: false
						},
						4: {
							leader: tenUsers[3],
							nominees: [tenUsers[3], tenUsers[4], tenUsers[5]],
							votes: makeUserMapping([
								[tenUsers[0], false],
								[tenUsers[1], false],
								[tenUsers[2], false],
								[tenUsers[3], true],
								[tenUsers[4], true],
								[tenUsers[5], false],
								[tenUsers[6], false],
								[tenUsers[7], false],
								[tenUsers[8], false],
								[tenUsers[9], false],
							]),
							approved: false
						},
						5: {
							leader: tenUsers[4],
							nominees: [tenUsers[4], tenUsers[5], tenUsers[6]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], false],
								[tenUsers[5], false],
								[tenUsers[6], false],
								[tenUsers[7], false],
								[tenUsers[8], true],
								// waiting on tenUsers[9]'s vote
							])
						}
					}
				}
			}
		});
	},
	"click button.assassination-time": function() {
		var tenUsers = getTenUsers();
		var tenRoleAssignments = getTenRoleAssignments(tenUsers);
		// A 10 person game where every round had its first nomination approved
		// and the nomination succeeded the mission every time for three rounds,
		// so now it's time for the assassin to try to choose merlin
		TestGameCreationController.call("insert", {
			name: "[test] Assassination time - " + new Date(),
			dateCreated: new Date(),
			creator: tenUsers[0],
			playerCount: 10,
			roles: tenRoles,
			players: tenUsers,
			playerRoles: tenRoleAssignments,
			status: Status.assassination,
			currentRound: 3,
			currentLeader: tenUsers[3],
			passedRoundsCount: 3,
			failedRoundsCount: 0,
			seenSecretInfo: tenUsers,
			rounds: {
				1: {
					nomineeCount: 2,
					failsRequired: 1,
					currentNominationNumber: 1,
					nominations: {
						1: {
							leader: tenUsers[0],
							nominees: [tenUsers[0], tenUsers[1]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], false],
								[tenUsers[5], false]
							]),
							approved: true
						}
					},
					mission: {
						nominationNum: 1,
						nominees: [tenUsers[0], tenUsers[1]],
						votes: makeUserMapping([
							[tenUsers[0], true],
							[tenUsers[1], true]
						]),
						outcome: {
							passCount: 2,
							failCount: 0,
							passed: true
						}
					}
				},
				2: {
					nomineeCount: 3,
					failsRequired: 1,
					currentNominationNumber: 1,
					nominations: {
						1: {
							leader: tenUsers[1],
							nominees: [tenUsers[1], tenUsers[0], tenUsers[2]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], false],
								[tenUsers[5], false]
							]),
							approved: true
						}
					},
					mission: {
						nominationNum: 1,
						nominees: [tenUsers[1], tenUsers[0], tenUsers[2]],
						votes: makeUserMapping([
							[tenUsers[0], true],
							[tenUsers[1], true],
							[tenUsers[2], true]
						]),
						outcome: {
							passCount: 3,
							failCount: 0,
							passed: true
						}
					}
				},
				3: {
					nomineeCount: 4,
					failsRequired: 1,
					currentNominationNumber: 1,
					nominations: {
						1: {
							leader: tenUsers[2],
							nominees: [tenUsers[2], tenUsers[1], tenUsers[0], tenUsers[3]],
							votes: makeUserMapping([
								[tenUsers[0], true],
								[tenUsers[1], true],
								[tenUsers[2], true],
								[tenUsers[3], true],
								[tenUsers[4], false],
								[tenUsers[5], false]
							]),
							approved: true
						}
					},
					mission: {
						nominationNum: 1,
						nominees: [tenUsers[2], tenUsers[1], tenUsers[0], tenUsers[3]],
						votes: makeUserMapping([
							[tenUsers[0], true],
							[tenUsers[1], true],
							[tenUsers[2], true],
							[tenUsers[3], true]
						]),
						outcome: {
							passCount: 4,
							failCount: 0,
							passed: true
						}
					}
				}
			},
			assassination: {
				assassin: tenUsers[6]
				/* victim: <userId> */
			}
		});
	},
});

});