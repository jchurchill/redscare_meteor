RedScare.NamespaceManager.define("Constants", {
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