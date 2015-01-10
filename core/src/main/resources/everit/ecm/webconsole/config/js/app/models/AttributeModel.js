define(["backbone"], function(Backbone) {

	var AttributeModel = Backbone.Model.extend({
		defaults: {
			id: null,
			name: null,
			description: null,
			value: null,
			type: null
		},
		hasOptions: function() {
			return this.get("type").options !== undefined;
		}
	});
	
	return AttributeModel;

});