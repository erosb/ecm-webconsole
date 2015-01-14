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
define(["backbone", "jquery", "viewfactory"], function(Backbone, $, viewfactory) {
	
	var ManagedServiceFactoryRowView = Backbone.View.extend({
		initialize: function() {
			this.model.on("change:visible", function() {
				this.$el[this.model.get("visible") ? "show" : "hide"]();
			}, this);
		},
		tagName: "tr",
		className: "ui-state-default managedservice-row",
		events: {
			"click td" : "displayConfig",
		},
		displayConfig: function() {
			this.model.loadConfiguration();
		},
		deleteConfig: function() {
			// nothing to do here
		},
		render: function() {
			var dom = viewfactory.loadTemplate("tmpl-managed-service-factory-row")({service: this.model});
			this.$el.append(dom);
			return this.$el;
		}
	});
	
	return ManagedServiceFactoryRowView;
});