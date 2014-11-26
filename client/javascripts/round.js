Template.round.helpers({
	templateToRender: function() {
		if (this.isAssassinationAttempt && this.isAssassinationAttempt()) {
			return "assassination";
		}
		if (this.isCurrentNominationReady && !this.isCurrentNominationReady()) {
			return "nomination";
		}
		if (this.isCurrentNominationVoting && this.isCurrentNominationVoting()) {
			return "voting";
		}
		if (this.isMissionHappening && 	this.isMissionHappening()) {
			return "mission";
		}
	}
});