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
define([ "backbone", "jquery", "ConfigurationDeletionView",
		"ManagedServiceFactoryRowView", "viewfactory" ], function(Backbone, $,
		ConfigurationDeletionView, ManagedServiceFactoryRowView, viewfactory) {
	"use strict";

	var ManagedServiceRowView = ManagedServiceFactoryRowView.extend({
		tagName : "tr",
		className : "ui-state-default managedservice-row",
		events : {
			"click .ui-icon-trash" : "deleteConfig",
			"click td" : "displayConfig"
		},
		deleteConfig : function(e) {
			e.stopPropagation();
			var deletionView = new ConfigurationDeletionView({
				model : this.model
			});
			deletionView.on("close", function() {
				this.trigger("deleted");
			}, this);
			deletionView.render();
		},
		render : function() {
			var dom = viewfactory.loadTemplate("tmpl-managed-service-row")({
				service : this.model
			});
			this.$el.append(dom);
			return this.$el;
		}
	});

	return ManagedServiceRowView;
});