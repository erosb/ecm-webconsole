/*
 * This file is part of Everit - Felix Webconsole Configuration.
 *
 * Everit - Felix Webconsole Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
define(["backbone", "jquery", "viewfactory", "backboneKeys"], function(Backbone, $, viewfactory) {
	"use strict";
	
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
			"click .btn-delete" : "triggerDelete",
			"keypress": "keyPressed"
		},
		keyPressed: function(e) {
			if (e.ctrlKey && e.key === "x" && this.nullable) {
				this.setToNull(e);
			} else if (e.ctrlKey && e.key === "d" && this.deletable) {
				this.triggerDelete(e);
			}
			if (this.$("input[name=value]").val()) {
				this.$("input[name=value]").attr("placeholder", "empty string");
			}
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
		setToNull: function(e) {
			if (this.nullable) {
				this.trigger("change", this.value = null);
				this.render();
			}
			e.stopPropagation();
			this.$("input[name=value]").focus();
		},
		triggerDelete: function() {
			this.trigger("delete");
		},
		render: function() {
			viewfactory = require("viewfactory");
			this.$el.empty().append(viewfactory.handlebarsTpl("tmpl-singular-primitive")({
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