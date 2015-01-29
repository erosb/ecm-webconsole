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
	"use strict";
	
	var SingularCheckboxAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.value = options.value;
			this.nullable = options.nullable;
		},
		tagName: "span",
		events: {
			"click .checkbox": "triggerChange",
			"click .btn-null": "setToNull",
			"keypress" : "keyPressed"
		},
		keyPressed: function(e) {
			if (e.key === " ") {
				this.triggerChange();
			} else if (this.nullable && e.ctrlKey && e.key === "x") {
				this.setToNull();
			}
			this.$(".checkbox").focus();
		},
		triggerChange: function() {
			this.value = !this.value;
			this.render();
			this.trigger("change", this.value);
		},
		setToNull: function() {
			this.value = null;
			this.render();
			this.trigger("change", this.value);
		},
		render: function() {
			this.$el.empty();
			viewfactory = require("viewfactory");
			var $dom = $(viewfactory.handlebarsTpl("tmpl-threestate-checkbox")({nullable: this.nullable}));
			var $checkbox = $dom.find(".checkbox");
			if (this.value === true) {
				$checkbox.addClass("ui-icon-check");
			} else if (this.value === false) {
				$checkbox.addClass("ui-treeview-emptyicon");
			} else {
				$checkbox.addClass("ui-icon-minus ui-state-disabled");
			}
			this.$el.append($dom);
			this.delegateEvents();
			return this.$el;
		}
	});
	
	return SingularCheckboxAttributeView;
});