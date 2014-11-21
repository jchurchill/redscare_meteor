GAME_PRESETS = {
	5: { 
		evils: 2,
		goods: 3,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 2, requiredFails: 1 },
			4: { nominations: 3, requiredFails: 1 },
			5: { nominations: 3, requiredFails: 1 }
		}
	},
	6: {
		evils: 2,
		goods: 4,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 3, requiredFails: 1 },
			5: { nominations: 4, requiredFails: 1 }
		}
	},
	7: {
		evils: 3,
		goods: 4,
		missions: {
			1: { nominations: 2, requiredFails: 1 },
			2: { nominations: 3, requiredFails: 1 },
			3: { nominations: 3, requiredFails: 1 },
			4: { nominations: 4, requiredFails: 2 },
			5: { nominations: 4, requiredFails: 1 }
		}
	},
	8: {
		evils: 3,
		goods: 5,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	},
	9: {
		evils: 3,
		goods: 6,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	},
	10: {
		evils: 4,
		goods: 6,
		missions: {
			1: { nominations: 3, requiredFails: 1 },
			2: { nominations: 4, requiredFails: 1 },
			3: { nominations: 4, requiredFails: 1 },
			4: { nominations: 5, requiredFails: 2 },
			5: { nominations: 5, requiredFails: 1 }
		}
	}
};

OUTCOMES = {
	CANCELLED: -1,
	GOOD_WINS: 1,
	EVIL_WINS_FROM_FAILS: 2,
	EVIL_WINS_FROM_ASSASSINATION: 3,
	EVIL_WINS_FROM_DOWNVOTES: 4
};

ROLES = {
	NORMAL_GOOD: 1,
	MERLIN: 2,
	PERCIVAL: 3,
	NORMAL_BAD: 4,
	ASSASSIN: 5,
	MORGANA: 6,
	OBERON: 7,
	MORDRED: 8
};
