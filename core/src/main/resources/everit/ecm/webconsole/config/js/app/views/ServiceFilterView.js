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
define(["backbone", "jquery"], function(Backbone, $) {
	
	function loadTemplate(templateId) {
		return _.template($("#" + templateId).text());
	}
	
	var ServiceFilterView = ecmconfig.ServiceFilterView = Backbone.View.extend({
		tagName: "span",
		className: "ui-widget ui-widget-content ui-state-default",
		attributes: {
			"tabindex": 0
		},
		events: {
			"keypress input" : "updateModel"
		},
		updateModel: function() {
			this.model.set("serviceFilter", this.$el.find("input").val());
		},
		render: function() {
			var dom = loadTemplate("tmpl-servicefilter")({serviceFilter: this.model.get("serviceFilter")});
			this.$el.empty().append(dom).find("input").focus();
			return this.$el;
		}
	});
	
});