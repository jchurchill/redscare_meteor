/**
* Returns a wrapper around Session
* which automatically prepends
* the specified name to all keys.
*
* @method namespace
* @param {String} name Name of namespace
* @param {String} [separator] Separator for prepended
*                 name. Default is '-'
* @return {Object} Namespaced session object
*/
var namespace = function namespace(name) {
  var separator = '.',
    prefix = name + separator;

  return {
    get: function (key) {
      return Session.get(prefix + key);
    },
    set: function (key, value) {
      return Session.set(prefix + key, value);
    },
    setDefault: function (key, value) {
      return Session.setDefault(prefix + key, value);
    },
    equals: function (key, value) {
      return Session.equals(prefix + key, value);
    },
    namespace: function(name) {
      return namespace(prefix + name);
    }
  };
};

_.extend(Session, {
  namespace: namespace
});