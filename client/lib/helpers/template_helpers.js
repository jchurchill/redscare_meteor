Template.registerHelper('to_json', function(obj) {
	return JSON.stringify(obj);
});
Template.registerHelper('parent', function() {
	return Template.parentData(1);
});
Template.registerHelper('plural', function(num) {
	return num != 1;
})