Meteor.startup(function() {

/* Ten users for testing
 * Their username is test{X}, where X in 1 - 10
 * Their password is equal to their username
 * Their email is their username @test.com */
(function(){
var Users = Meteor.users;
if (Users.find().count() === 0) {
	_.each(_.range(1,11), function(i) {
		Accounts.createUser({
			username: "test" + i,
			email: "test" + i + "@test.com",
			password: "test" + i
		});
	});
}
}());

// Games in different states
(function(){
var Games = RedScare.Collections.Games;
var Roles = RedScare.Constants.roles;
var Status = RedScare.Constants.gameStatus;
var Users = Meteor.users;

var makeUserMapping = function(tuples) {
	return _.indexByAndMap(
		tuples,
		function(t) { return t[0]; },
		function(t) { return t[1]; });
};

if (Games.find().count() === 0) {
	// Construct some game setup common to all testing games
	var sixUsers = _.pluck(Users.find({}, { fields: { _id: 1 }}).fetch(), "_id");
	var sixRoles = [
		Roles.normalGood, Roles.normalGood, Roles.normalGood, Roles.merlin,
		Roles.normalEvil, Roles.assassin];
	var sixRoleAssignments = makeUserMapping([
			[sixUsers[0], Roles.normalGood],
			[sixUsers[1], Roles.normalGood],
			[sixUsers[2], Roles.normalGood],
			[sixUsers[3], Roles.merlin],
			[sixUsers[4], Roles.normalEvil],
			[sixUsers[5], Roles.assassin]
		]);

	// A 6-person game that's waiting for one more player
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - waiting for players",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		players: sixUsers.slice(0,5),
		status: Status.waitingForPlayers,
	});

	// A 6 person game that just began and is now in the first nominating phase for round 1
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - waiting for nominations",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		playerRoles: sixRoleAssignments,
		players: sixUsers,
		status: Status.nominating,
		currentRound: 1,
		currentLeader: sixUsers[0],
		passedRoundsCount: 0,
		failedRoundsCount: 0,
		rounds: {
			1: {
				nomineeCount: 2,
				failsRequired: 1,
				currentNominationNumber: 1
			}
		}
	});

	// A 6 person game that just began, the leader has nominated the first set of people,
	// and players are now doing approval voting for it
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - waiting for approval votes",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		players: sixUsers,
		playerRoles: sixRoleAssignments,
		status: Status.nominationVoting,
		currentRound: 1,
		currentLeader: sixUsers[0],
		passedRoundsCount: 0,
		failedRoundsCount: 0,
		rounds: {
			1: {
				nomineeCount: 2,
				failsRequired: 1,
				currentNominationNumber: 1,
				nominations: {
					1: {
						leader: sixUsers[0],
						nominees: [sixUsers[0], sixUsers[1]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], false],
							[sixUsers[2], true],
							[sixUsers[3], false],
							[sixUsers[4], true]
						])
					}
				}
			}
		}
	});

	// A 6 person game that had its first round first nomination get rejected,
	// but then its first round second nomination was approved
	// and the nominees are now going on a mission
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - mission happening",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		players: sixUsers,
		playerRoles: sixRoleAssignments,
		status: Status.missionVoting,
		currentRound: 1,
		currentLeader: sixUsers[1],
		passedRoundsCount: 0,
		failedRoundsCount: 0,
		rounds: {
			1: {
				nomineeCount: 2,
				failsRequired: 1,
				currentNominationNumber: 1,
				nominations: {
					1: {
						leader: sixUsers[0],
						nominees: [sixUsers[0], sixUsers[1]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], false],
							[sixUsers[2], true],
							[sixUsers[3], false],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: false
					},
					2: {
						leader: sixUsers[1],
						nominees: [sixUsers[1], sixUsers[2]],
						votes: makeUserMapping([
							[sixUsers[0], false],
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], true],
							[sixUsers[5], false]
						]),
						approved: true
					},
				},
				mission: {
					nominationNum: 1,
					nominees: [sixUsers[1], sixUsers[2]],
					votes: makeUserMapping([
						[sixUsers[1], true]
						// waiting on sixUsers[2] to vote
					]),
				}
			}
		}
	});

	// A 6 person game where on the first round no one approved any missions
	// so now the 5th nomination has been made and its downvote chicken time,
	// and the difference between pass and lose relies on only one final uncast vote
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - downvote chicken",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		players: sixUsers,
		playerRoles: sixRoleAssignments,
		status: Status.nominationVoting,
		currentRound: 1,
		currentLeader: sixUsers[4],
		passedRoundsCount: 0,
		failedRoundsCount: 0,
		rounds: {
			1: {
				nomineeCount: 2,
				failsRequired: 1,
				currentNominationNumber: 1,
				nominations: {
					1: {
						leader: sixUsers[0],
						nominees: [sixUsers[0], sixUsers[1]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], true],
							[sixUsers[2], false],
							[sixUsers[3], false],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: false
					},
					2: {
						leader: sixUsers[1],
						nominees: [sixUsers[1], sixUsers[2]],
						votes: makeUserMapping([
							[sixUsers[0], false],
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], false],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: false
					},
					3: {
						leader: sixUsers[2],
						nominees: [sixUsers[2], sixUsers[3]],
						votes: makeUserMapping([
							[sixUsers[0], false],
							[sixUsers[1], false],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: false
					},
					4: {
						leader: sixUsers[3],
						nominees: [sixUsers[3], sixUsers[4]],
						votes: makeUserMapping([
							[sixUsers[0], false],
							[sixUsers[1], false],
							[sixUsers[2], false],
							[sixUsers[3], true],
							[sixUsers[4], true],
							[sixUsers[5], false]
						]),
						approved: false
					},
					5: {
						leader: sixUsers[4],
						nominees: [sixUsers[4], sixUsers[5]],
						votes: makeUserMapping([
							// waiting on sixUsers[0]'s vote
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], false],
							[sixUsers[5], false]
						])
					}
				}
			}
		}
	});

	// A 6 person game where every round had its first nomination approved
	// and the nomination succeeded the mission every time for three rounds,
	// so now it's time for the assassin to try to choose merlin
	Games.insert({
		name: "Dustin's Foggy Bottom Game Night - assassination time",
		dateCreated: new Date(),
		creator: sixUsers[0],
		playerCount: 6,
		roles: sixRoles,
		players: sixUsers,
		playerRoles: sixRoleAssignments,
		status: Status.assassination,
		currentRound: 3,
		currentLeader: sixUsers[3],
		passedRoundsCount: 3,
		failedRoundsCount: 0,
		rounds: {
			1: {
				nomineeCount: 2,
				failsRequired: 1,
				currentNominationNumber: 1,
				nominations: {
					1: {
						leader: sixUsers[0],
						nominees: [sixUsers[0], sixUsers[1]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: true
					}
				},
				mission: {
					nominationNum: 1,
					nominees: [sixUsers[0], sixUsers[1]],
					votes: makeUserMapping([
						[sixUsers[0], true],
						[sixUsers[1], true]
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
						leader: sixUsers[1],
						nominees: [sixUsers[1], sixUsers[0], sixUsers[2]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: true
					}
				},
				mission: {
					nominationNum: 1,
					nominees: [sixUsers[1], sixUsers[0], sixUsers[2]],
					votes: makeUserMapping([
						[sixUsers[0], true],
						[sixUsers[1], true],
						[sixUsers[2], true]
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
						leader: sixUsers[2],
						nominees: [sixUsers[2], sixUsers[1], sixUsers[0], sixUsers[3]],
						votes: makeUserMapping([
							[sixUsers[0], true],
							[sixUsers[1], true],
							[sixUsers[2], true],
							[sixUsers[3], true],
							[sixUsers[4], false],
							[sixUsers[5], false]
						]),
						approved: true
					}
				},
				mission: {
					nominationNum: 1,
					nominees: [sixUsers[2], sixUsers[1], sixUsers[0], sixUsers[3]],
					votes: makeUserMapping([
						[sixUsers[0], true],
						[sixUsers[1], true],
						[sixUsers[2], true],
						[sixUsers[3], true]
					]),
					outcome: {
						passCount: 4,
						failCount: 0,
						passed: true
					}
				}
			}
		},
		assassination: { /* victim not chosen yet */ }
	});
}
}());

});