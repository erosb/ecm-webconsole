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
define([ "backbone", "jquery", "SingularCheckboxAttributeView" ], function(
		Backbone, $, SingularCheckboxAttributeView) {
	"use strict";

	var CheckboxListView = Backbone.View.extend({
		initialize : function(options) {
			this.values = options.values;
		},
		tagName : "div",
		createEventHandler: function(value) {
			var values = this.values;
			return function() {
				var idx = values.indexOf(value);
				if (idx > -1) {
					values.splice(idx, 1);
				} else {
					values.push(value);
				}
			};
		},
		render : function() {
			var self = this;
			var options = this.model.get("type").options;
			for ( var text in options) {
				if (options.hasOwnProperty(text)) {
					var value = options[text];
					var $checkbox = new SingularCheckboxAttributeView({
						value : self.values.indexOf(value) > -1
					});
					$checkbox.on("change", this.createEventHandler(value));
					this.$el.append($checkbox.render()).append(text).append(
							"<br>");
				}
			}
			return this.$el;
		}
	});

	return CheckboxListView;
});