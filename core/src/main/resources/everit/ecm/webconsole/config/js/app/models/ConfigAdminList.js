define(["backbone", "ConfigAdminModel"], function(Backbone, ConfigAdminModel) {
	
	var ConfigAdminList = ecmconfig.ConfigAdminList = Backbone.Collection.extend({
		model: ConfigAdminModel
	});
	
	return ConfigAdminList;
	
});