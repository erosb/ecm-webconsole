define(["backbone"], function(Backbone) {
	
	var ConfigAdminModel = Backbone.Model.extend({
		defaults: {
			pid: null,
			bundleId: null,
			description: null
		}
	});
	
	return ConfigAdminModel;
});