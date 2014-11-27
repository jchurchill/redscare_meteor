var Namespace = function(name) {
	if (!(name && typeof name === 'string')) {
		throw "Missing argument: name [string]";
	}
	this._name = name;
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
Namespace.prototype.addMember = function(name, val) {
	this._add(name, val);
};
Namespace.prototype.addNamespace = function(name) {
	var ns = new Namespace(name);
	this._add(name, ns);
	return ns;
};

// A namespace for objects / functions related to games, updating them, etc.
Game = new Namespace("Game");