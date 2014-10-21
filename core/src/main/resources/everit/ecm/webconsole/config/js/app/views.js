$(document).ready(function() {
(function(ecmconfig) {
	
	var ConfigurationListView = ecmconfig.ConfigurationListView = Backbone.View.extend({
		tagName : "tbody"
	});
	
	var ConfigAdminListView = ecmconfig.ConfigAdminListView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model.get("configAdminList"), "reset", this.render);
			this.model.on("change:selectedConfigAdmin", this.render, this);
		},
		render: function() {
			this.$el.empty();
			var dom = _.template($("#tmpl-config-admin-list").text())({
				configAdmins: this.model.get("configAdminList")
			});
			this.$el.append(dom);
			var selectedConfigAdmin = this.model.get("selectedConfigAdmin");
			if (selectedConfigAdmin != null) {
				selectedConfigAdmin.getConfigurations(function(config) {
					console.log("config: ", config);
				})
			}
			return this.$el;
		}
	});

})(window.ecmconfig);
});