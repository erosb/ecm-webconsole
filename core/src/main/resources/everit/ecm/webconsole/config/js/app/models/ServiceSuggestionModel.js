define(["backbone"], function(Backbone) {
	
	var ServiceSuggestionModel = Backbone.Model.extend({
		defaults: {
			serviceClass: null,
			properties: []
		}
	});
	
	return ServiceSuggestionModel;
});