MeteorController = (function() {
	function prependNamespace(prefix, name) {
		if (prefix && name) {
			return prefix + '.' + name;
		}
		return prefix || name || "";
	};
	function namespacedControllerFactory(namespace) {
		var namespaced = function(name) {
			return prependNamespace(namespace, name);
		}
		return {
			methods: function(methodsObj) {
				var namespacedMethodsObj = _.foldl(
					methodsObj,
					function(obj, value, key) {
						obj[namespaced(key)] = value;
						return obj;
					}, {});
				Meteor.methods(namespacedMethodsObj);
			},
			call: function(/*arguments*/) {
				// arguments[0] is the method name
				arguments[0] = namespaced(arguments[0]);
				Meteor.call.apply(null, arguments);
			},
			apply: function(name, args, options, asyncCallback) {
				// name is the method name
				Meteor.apply(namespaced(name), args, options, asyncCallback);
			},
			namespace: function(ns) {
				return namespacedControllerFactory(prependNamespace(ns, namespace));
			}
		};
	}
	return namespacedControllerFactory();
})();