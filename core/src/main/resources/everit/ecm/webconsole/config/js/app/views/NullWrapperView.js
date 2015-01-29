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
define(["backbone"], function(Backbone) {
	"use strict";
	
	var NullWrapperView = Backbone.View.extend({
		initialize: function(options) {
			this.subview = options.subview;
			this.value = options.value;
			this.subview.on("change", this.subviewValueChanged, this);
			this.subview.on("delete", this.triggerDelete, this);
		},
		events: {
			"click .btn-not-specified" : "renderSubview"
		},
		subviewValueChanged: function(value) {
			if (value === null) {
				this.renderNotSpecified();
			}
			this.trigger("change", value);
		},
		triggerDelete: function() {
			this.trigger("delete");
		},
		renderSubview: function() {
			this.$el.html(this.subview.render());
			this.subview.gainFocus();
		},
		renderNotSpecified: function() {
			this.$el.html("<a class='btn-not-specified' href='javascript:;'>Not specified (click to specify)</a>");
		},
		render: function() {
			if (this.value === null) {
				this.renderNotSpecified();
			} else {
				this.renderSubview();
			}
			return this.$el;
		}
	});
	
	return NullWrapperView;
});