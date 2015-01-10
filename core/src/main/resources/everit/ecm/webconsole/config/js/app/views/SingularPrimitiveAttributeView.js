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
	
	var SingularPrimitiveAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.inputType = options.inputType;
			this.value = options.value;
			this.nullable = options.nullable; 
			this.deletable = options.deletable;
		},
		tagName: "div",
		attributes: {
			style: "width: 99%"
		},
		events : {
			"blur input[name=value]" : "valueChanged",
			"click .btn-null": "setToNull",
			"click .btn-delete" : "triggerDelete"
		},
		valueChanged: function() {
			var $input = this.$el.find("input[name=value]");
			var newValue = $input.val();
			if (newValue === "" && this.value === null) {
				return;
			}
			this.value = newValue;
			if (this.value === "") {
				this.render();
			}
			this.trigger("change", this.value);
		},
		setToNull: function() {
			this.trigger("change", this.value = null);
			this.render();
		},
		triggerDelete: function() {
			this.trigger("delete");
		},
		render: function() {
			var self = this;
			this.$el.empty().append(loadTemplate("tmpl-singular-primitive")({
				nullable: this.nullable,
				deletable: this.deletable,
				value: this.value === null ? "" : this.value,
				placeholder: this.value === null ? "null" : "empty string", 
				type: this.inputType
			}));
			return this.$el;
		}
	});
	
	return SingularPrimitiveAttributeView;
});