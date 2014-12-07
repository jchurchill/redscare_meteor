RedScare.NamespaceManager.define("Services.TransitionUtilities");

Meteor.startup(function() {
// Usings
var TransitionUtilities = RedScare.Services.TransitionUtilities;

//////////////////////////////////////////////
// Public methods 
/////////////////////////////////////////////

/*
 * Given a document undergoing a delayed transition, invoke a function
 * every intervalMs milliseconds. Passed to the function as the only argument
 * will be the estimated number of milliseconds remaining until the transition occurs.
 * This wires the countdown up reactively so that if the transition is cancelled,
 * the countdown will halt, and if the transition is renewed, a new countdown will start.
 *
 * The argument template is required so that this reactivity can be wired up to the
 * template. Additionally, the template is used to get the current datacontext to pass
 * to getTransitionFromTemplateDataContext in order to get information about the doc's 
 * current transition state.
 * 
 * Example usage would probably be found inside the template's created callback:
 * 	Template.playersJoining.created = function() {
 *		TransitionUtilities.setupTransitionCountdown(
 *			this,
 *			1000,
 *			function(dc) { return dc._transition; },
 *			function(remainingMs) {
 *				var remainingSeconds = Math.floor(remainingMs / 1000);
 *				TemplateSession.set("secondsUntilTransition", remainingSeconds);
 *			});
 *	};
 */
TransitionUtilities.setupTransitionCountdown = function(template, intervalMs, getTransitionFromTemplateDataContext, countdownIntervalFn) {
	var countdownState = {};
	template.autorun(function(c) {
		var transition = getTransitionFromTemplateDataContext(Template.currentData());

		// If the doc is not in a transitioning state, clear the outstanding
		// transition countdown if it exists, and don't do anything else
		if (!transition) {
			Meteor.clearInterval(countdownState.interval);
			return;
		}

		// If the currently registered transition is the same as
		// the doc's transition, do nothing
		if (countdownState.id === transition.id) {
			return;
		}

		// Else, clear the current one, and set up a new one below
		Meteor.clearInterval(countdownState.interval);

		// Determine how many seconds remain until transition
		var msUntilTransition = Math.max(transition.date - Date.now(), 0);
		countdownIntervalFn(msUntilTransition);

		if (msUntilTransition === 0) {
			return;
		}

		// Every second, count down, stopping once 0 is reached
		function updateCountdown() {
			msUntilTransition = Math.max(msUntilTransition - intervalMs, 0);
			countdownIntervalFn(msUntilTransition);
			if (msUntilTransition === 0) {
				Meteor.clearInterval(countdownState.interval);
			}
		};

		countdownState = {
			id: transition.id,
			interval: Meteor.setInterval(updateCountdown, intervalMs)
		};
	});
};

/////////////////////////////////
// Private methods
/////////////////////////////////

// none

});