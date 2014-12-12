RedScare.NamespaceManager.define("Collections");

Meteor.startup(function() {

var Collections = RedScare.Collections;

Collections.add("Games",
	new Mongo.Collection("games", { 
		transform: function(doc) { return new Game(doc); }
	})
);

// if (Meteor.isServer) {
// 	Meteor.publish("games", function(gameId) {
// 		return RedScare.Collections.Games.findOne(gameId, {
// 			// The following is "secret", and should not be included with a normal subscription
// 			fields: {
// 				playerRoles: 0, // Revealed only when the game is over
// 				// Nomination votes, revealed only when outcome of nomination has been decided
// 				// Mission votes, revealed only when the game is over
// 			}
// 		});
// 	});
// }

var Game = function(doc) {
	_.extend(this, doc);
	// Map rounds into the Round transform
	this.rounds = _.mapProperties(this.rounds, function(roundDoc, roundNum) {
		return new Round(roundNum, roundDoc);
	});
};
_.extend(Game.prototype, {
	isAbandoned: function() {
		return !!this.dateAbandoned;
	},
	containsRole: function(roleId) {
		return _.any(this.roles, function(r) { return r === roleId; });
	},
	getSetupConstants: function() {
		return RedScare.Constants.presets[this.playerCount];
	},
	pendingTransition: function(key) {
		var trs = this._transition;
		if (trs) { return trs[key]; }
		return;
	},
	isCurrentUserLeader: function() {
		return this.currentLeader === Meteor.userId();
	},
	getNextLeader: function() {
		var leaderIndex = this.players.indexOf(this.currentLeader);
		if (leaderIndex < 0 || this.players.length !== this.playerCount) {
			return;
		}
		// Get the next player in the list, wrapping around to the beginning
		return this.players[(leaderIndex + 1) % this.playerCount];
	},
	getCurrentRound: function() {
		if (this.currentRound > 0) {
			return this.rounds && this.rounds[this.currentRound];
		}
	},
	getCurrentNomination: function() {
		var round = this.getCurrentRound();
		if (round && round.currentNominationNumber > 0) {
			return round.nominations && round.nominations[round.currentNominationNumber];
		}
	},
	// TODO: move to the nomination template - it's too specific to be here
	hasCurrentUserVoted: function() {
		var round = this.getRound(this.currentRound);
		var votes = round.nominations[round.currentNominationNumber].votes;
		return votes.hasOwnProperty(Meteor.userId());
	},
	// TODO: move to the assassination template - it's too specific to be here
	isCurrentUserAssassin: function() {
		return Meteor.userId() === this.assassination.assassin;
	}
});



var Round = function(roundNum, roundDoc) {
	_.extend(this, roundDoc);
	this.roundNum = roundNum;
	// Map nominations into the Nomination transform
	if (this.nominations) {
		this.nominations = _.mapProperties(this.nominations, function(nominationDoc, nominationNum) {
			return new Nomination(nominationNum, nominationDoc);
		});
	}
	// Apply Mission transform to mission
	if (this.mission) {
		this.mission = new Mission(this.mission);
	}
};
_.extend(Round.prototype, {
});



var Nomination = function(nominationNum, nominationDoc) {
	_.extend(this, nominationDoc);
	this.nominationNum = nominationNum;
};
_.extend(Nomination.prototype, {
});



var Mission = function(missionDoc) {
	_.extend(this, missionDoc);
};
_.extend(Mission.prototype, {
});


});