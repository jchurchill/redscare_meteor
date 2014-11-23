_.mixin({
	// The code below will extend underscore.js adding the groupByAndMap function.
	// groupByAndMap works like the regular groupBy, but it accepts an optional third "selector" argument.
	// The 'selector' is used to select values inside each group.
	// As usual in underscore, you can either pass a function or a string with the name of an attribute you want.
	// groupByAndMap is useful when you don't want the key to be present in the values inside the group.
	// Also, it completely covers the groupBy functionality because the last argument is optional.
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
	// indexByAndMap works like the regular indexBy, but it accepts an optional third "selector" argument.
	// The 'selector' is used to select values inside each indexed result.
	// As usual in underscore, you can either pass a function or a string with the name of an attribute you want.
	// indexByAndMap is useful when you don't want the key to be present in the values inside the indexed result.
	// Also, it completely covers the indexBy functionality because the last argument is optional.
	indexByAndMap: function(list, keySelector, valueSelector) {
		function lookupIterator(val) {
			return _.isFunction(val) ? val : function(obj) { return obj[val]; };
		};
 
		var keySelectorFunc = lookupIterator(keySelector);
		var valueSelectorFunc = valueSelector ? lookupIterator(valueSelector) : _.identity;
 
		return _.foldl(list, function(result, value) {
			var key = keySelectorFunc(value);
			result[key] = valueSelectorFunc(value);
			return result;
		}, {});
	},
	mapMany: function(list, iteratee, context) {
		return _.flatten(_.map(list, iteratee, context), true);
	},
	// Similar to map, but exists mainly for objects when the values should all be mapped in the same way.
	// Example: _.mapProperties({a:1, b:2}, function(x) { return x*2; }) => {a:2, b:4}
	mapProperties: function(obj, valueMapFn, context) {
		function lookupIterator(val) {
			return _.isFunction(val) ? val : function(obj) { return obj[val]; };
		};
		var valueSelectorFunc = valueMapFn ? lookupIterator(valueMapFn) : _.identity;

		return _.foldl(obj, function(result, value, key) {
			result[key] = valueSelectorFunc(value);
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
	// Returns a function that will itself return the key property of any passed-in object.
	// This exist in underscore 1.6.0, which meteor does not yet support
	property: function(key) {
		return function(o) { return o[key]; };
	},
	// Creates a function that returns the same value that is used as the argument of _.constant.
	// This exist in underscore 1.6.0, which meteor does not yet support
	constant: function(val) {
		return function() { return val; };
	},
	// Similar to property, except the property is a function that will get invoked
	// to return a result. If extra arguments are passed to this method after the first,
	// they will be passed to the function when invoked.
	method: function(name) {
		var args = _.tail(arguments),
			isFunc = _.isFunction(name);
		return function(value) {
			return (isFunc ? name : value[name]).apply(value, args);
		};
	},
});