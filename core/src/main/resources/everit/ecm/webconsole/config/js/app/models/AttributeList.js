define(["backbone", "AttributeModel"], function(Backbone, AttributeModel) {
	var AttributeList = Backbone.Collection.extend({
		model: AttributeModel
	});
	
	return AttributeList;
});