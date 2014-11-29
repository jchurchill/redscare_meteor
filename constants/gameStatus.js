RedScare.NamespaceManager.define("Constants", {
	gameStatus: Object.freeze({
		abandoned: -1,
		waitingForPlayers: 1,
		starting: 2,
		nominating: 3,
		nominationVoting: 4,
		missionVoting: 5,
		assassination: 6,
		gameOver: 7
	})
});