_.extend(Meteor.Collection.prototype, {
	delayedUpdate: delayedUpdate
});

/*
 * Perform a delayed update on a collection. If any other delayedUpdate
 * is registered to occur on the collection before this one, any previously
 * registered delayed update will not occur.
 * 
 * This is useful if you know you want to perform an update, but you want
 * to wait a moment so that you can allow the user to observe that we're in
 * a state where we're about to update.
 * In order to do this, you can take advantage of the following properties
 * this adds to the collection:
 * - _transition: an object only set on the document if we're going to transition
 * - _transition.id: an identifier for the registered delayed update
 * - _transition.date: the approximate date (server time) when the actual update will occur
 * When the actual update occurs, the _transition object is unset.
 */
function delayedUpdate(delayMs, condition, update, callback) {
	var thisCollection = this;
	var transitionId = Meteor.uuid();
	var transitionAt = new Date(Date.now() + delayMs);
	var actualUpdate = update;

	// 1: Update _transition object to mark that a transition will occur
	// at a point in the future delayMs from now
	var transitionUpdates = {
		$set: {
			_transition: {
				id: transitionId,
				date: transitionAt
			}
		}
	};

	// 2: If the transition object update was successful, set a delayed
	// timeout on the server to perform the actual update (provided that
	// the signature of the actual update stayed the same)
	var performActualUpdate = function() {
		// Mix the transition unset with whatever other updates were occurring
		var transition$unset = { _transition: '' };
		var actualUpdate$unset = actualUpdate.$unset || {};
		actualUpdate.$unset = _.extend(actualUpdate$unset, transition$unset);

		var transitionCondition = {
			"_transition.id": transitionId
		};
		var fullCondition = _.extend(condition, transitionCondition);
		
		thisCollection.update(fullCondition, actualUpdate, callback);
	};

	// Compose the above into update (1) followed by a delayed update (2) if successful
	thisCollection.update(condition, transitionUpdates, function(err, updateCount) {
		if (err || updateCount === 0 || Meteor.isClient) {
			return;
		}
		Meteor.setTimeout(performActualUpdate, delayMs);
	})
};