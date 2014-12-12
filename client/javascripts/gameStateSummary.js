Meteor.startup(function() {
// Usings
var TemplateSession = Session.namespace("gameStateSummary");
var Users = Meteor.users;

Template.gameStateSummary.helpers({
	gameRounds: function() {
		// Returns:
		// { roundNum: (int), presets: (presets), round: (Round) } for rounds 1-5
		// If the round hasn't begun yet, round will be null.
		var totalRounds = 5,
			existingRounds = this.rounds,
			allRounds = _.range(1,totalRounds+1),
			presets = this.getSetupConstants();
		return _.chain(allRounds)
			.map(function (r) {
				return { roundNum: r, presets: presets.missions[r], round: existingRounds[r] };
			})
			.sortBy(_.property("roundNum"))
			.value();
	},
	selectedRound: function() {
		var roundNum = helpers.scopedSession(this._id).get("selectedRound");
		return this.rounds[roundNum];
	}
});

Template.gameStateSummary_round.helpers({
	selected: function() {
		var gameId = Template.parentData(1)._id;
		return helpers.scopedSession(gameId).get("selectedRound") === this.roundNum;
	}
});

Template.gameStateSummary_round.events({
	"click .round-token": function(e) {
		var	roundTokenSelector = ".round-token:not(.disabled)",
			nonDisabledRoundToken = $(e.target).parent(roundTokenSelector).andSelf(roundTokenSelector)[0],
			gameId = Template.parentData(1)._id;
		if (nonDisabledRoundToken) {
			helpers.scopedSession(gameId).set("selectedRound", this.roundNum);
		}
	}
});

Template.gameStateSummary_roundDetail.helpers({
	roundNominations: function() {
		return _.chain(this.nominations).values()
			.sortBy(_.property("nominationNum")).value();
	},
	nominatingUser: function() {
		return Users.findOne(this.leader, { fields: { _id: 1, username: 1 }});
	},
	playersNominated: function() {
		return helpers.playerUsers(this.nominees);
	},
	playerVotingDetails: function() {
		return _.chain(this.votes)
			.map(function(vote, userId) {
				var user = Users.findOne(userId, { fields: { _id: 1, username: 1 }});
				var voteClass = vote ? "player-upvoted" : "player-downvoted";
				return { user: user, vote: vote, voteClass: voteClass };
			})
			// Always sort by something to keep display order consistent
			.sortBy(function(vd) { return vd.user._id; })
			.value();
	}
});

// Template.gameStateSummary_mission.helpers({
// 	playersOnMission: function() {
// 		return helpers.playerUsers(this.nominees);
// 	}
// });

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
helpers.scopedSession = function(gameId) {
	return TemplateSession.namespace(gameId);
};

});