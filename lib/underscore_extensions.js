_.mixin({
	// The code below will extend underscore.js adding the groupByAndMap function.
	// groupByAndMap works like the regular groupBy, but it accepts an optional third "selector" argument.
	// The 'selector' is used to select values inside each group.
	// As usual in underscore, you can either pass a function or a string with the name of an attribute you want.
	// groupByAndMap is useful when you don't want the key to be present in the values inside the group.
	// Also, it completely covers the groupBy functionality because the last argument is optional.
	// If you want, you can replace groupBy instead of defining a new function.
	groupByAndMap: function(list, keySelector, valueSelector) {
		function lookupIterator(val) {
			return _.isFunction(val) ? val : function(obj) { return obj[val]; };
		};
 
		var keySelectorFunc = lookupIterator(keySelector);
		var valueSelectorFunc = valueSelector ? lookupIterator(valueSelector) : _.identity;
 
		return _.foldl(list, function(result, value) {
		  var key = keySelectorFunc(value);
		  (result[key] || (result[key] = [])).push(valueSelectorFunc(value));
		  return result;
		}, {});
	},
	// Return all keys of an object whose value satifies some predicate function.
	keysWhere: function(obj, valuePredicate, context) {
		return _.chain(obj).pairs()
			.filter(function(p) { return valuePredicate.call(context, p[1]); })
			.map(function(p) { return p[0]; })
			.value();
	},
});