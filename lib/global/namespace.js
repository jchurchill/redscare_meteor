var Namespace = function(name, parentNamespace) {
	if (!(name && typeof name === 'string')) {
		throw "Missing argument: name [string]";
	}
	if (!(parentNamespace == null || parentNamespace instanceof Namespace)) {
		throw "Argument parentNamespace: type must be [Namespace]"
	}
	this._name = name;
	this._parentNamespace = parentNamespace;
	return this;
};
Namespace.prototype._add = function(name, val) {
	var exists = (this[name] !== undefined);
	if (exists) { 
		throw "Namespace conflict in " + this._name + ": '" + name + "'";
	}
	Object.defineProperty(this, name, {
		value: val,
		enumerable: true,
		writable: false,
		configurable: false
	});
};
Namespace.prototype._fullName = function() {
	var currentNamespace = this,
		fullName = this._name;
	while (currentNamespace._parentNamespace != null) {
		currentNamespace = currentNamespace._parentNamespace;
		fullName = currentNamespace._name + "." + fullName;
	}
	return fullName;
};


var NamespaceManager = function(rootNamespace) {
	if (!(rootNamespace == null || rootNamespace instanceof Namespace)) {
		throw "Argument rootNamespace: type must be [Namespace]"
	}
	this._rootNamespace = rootNamespace;
};
NamespaceManager.prototype.define = function(namespace, members) {
	var names = namespace.split("."),
		currentContext = this._rootNamespace;

	// Add namespaces if they don't already exist
	_.each(names, function(name, idx) {
		var nextContext = currentContext[name];
		if (name.length === 0) {
			throw "Invalid namespace: " + namespace;
		}
		// If it doesn't already exist, create it
		if (!nextContext) {
			currentContext[name] = new Namespace(name, currentContext);
		}
		// If it does already exist, check that it's actually a
		// Namespace and not some member of the namespace
		else if (!(nextContext instanceof Namespace)) {
			throw "Cannot define members in a namespace that is already used for a different member: " + name;
		}
		currentContext = currentContext[name];
	});

	// Add members
	_.each(members, function(value, key) {
		if (currentContext[key]) {
			throw "Member '" + key + "' already exists in namespace '" + namespace + "'";
		}
		currentContext[key] = value;
	});
};


RedScare = new Namespace("RedScare");
RedScare.NamespaceManager = new NamespaceManager(RedScare);