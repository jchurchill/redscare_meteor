// TODO: don't put this object in the global ns
MeteorController = (function() {
	function applyNamespace(ns, name) {
		if (ns) {
			return ns + '.' + name;
		}
		return name;
	};
	function controllerFactory(namespace) {
		namespacePrefix = namespacePrefix || "";
		return {
			methods: function(methodsObj) {
				var namespacedMethodsObj = _.foldl(
					methodsObj,
					function(obj, value, key) {
						var namespacedKey = applyNamespace(namespace, key);
						obj[namespacedKey] = value;
					}, {});
				Meteor.methods(namespacedMethodsObj);
			},
			call: function(/*arguments*/) {
				// arguments[0] is the method name
				arguments[0] = applyNamespace(namespace, arguments[0]);
				Meteor.call(arguments);
			},
			apply: function(name, args, options, asyncCallback) {
				// name is the method name
				var namespacedMethodName = applyNamespace(namespace, name);
				Meteor.apply(namespacedMethodName, args, options, asyncCallback);
			},
			namespace: function(ns) {
				return controllerFactory(applyNamespace(ns, namespace));
			}
		};
	}
	return controllerFactory();
})();