/*
 * This file is part of Everit - Felix Webconsole ECM Configuration.
 *
 * Everit - Felix Webconsole ECM Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole ECM Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole ECM Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
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