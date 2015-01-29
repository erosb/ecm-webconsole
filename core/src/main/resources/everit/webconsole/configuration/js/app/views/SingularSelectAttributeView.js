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
define([ "backbone" ], function(Backbone) {
	"use strict";

	var SingularSelectAttributeView = Backbone.View.extend({
		initialize : function(options) {
			this.options = options.options;
			this.value = options.value;
		},
		tagName : "select",
		className : "ui-state-default ui-corner-all",
		events : {
			"change" : "triggerChange"
		},
		triggerChange : function() {
			this.trigger("change", this.el.value);
		},
		render : function() {
			this.$el.empty();
			for ( var name in this.options) {
				if (this.options.hasOwnProperty(name)) {
					var optValue = this.options[name];
					var optElem = document.createElement("option");
					optElem.setAttribute("value", optValue);
					if (optValue == this.value) {
						optElem.setAttribute("selected", true);
					}
					optElem.innerHTML = name;
					this.$el.append(optElem);
				}
			}
			return this.$el;
		}
	});

	return SingularSelectAttributeView;
});