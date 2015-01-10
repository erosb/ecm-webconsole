define([
        "backbone",
        "ManagedServiceModel"
], function(Backbone, ManagedServiceModel) {
	
	var ManagedServiceList = Backbone.Collection.extend({
		model: ManagedServiceModel,
		topLevelEntries: function() {
			return this.filter(function(e) {
				return !e.hasFactory()
			});
		},
		getInstancesOf: function(factoryService) {
			var factoryPid = factoryService.get("factoryPid");
			return this.filter(function(e) {
				return e.get("factoryPid") == factoryPid && e.get("pid") !== null;
			});
		}
	});
	
	return ManagedServiceList;
	
});
