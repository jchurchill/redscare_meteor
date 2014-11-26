Template.animation_test.helpers({
  open: function() {
    if (Session.get("open")) {
      return "open";
    }
  }
});
Template.animation_test.events({
  "click #clickme": function() {
    Session.set("open", !Session.get("open"));
  }
});