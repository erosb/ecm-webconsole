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
define(["backbone", "jquery", "viewfactory", "ServiceSelectorView"], function(Backbone, $,
		viewfactory,
		ServiceSelectorView) {
	
	var ServiceAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.attrModel = options.attrModel;
			this.value = options.value;
			this.nullable = options.nullable; 
			this.deletable = options.deletable;
		},
		events: {
			"click .btn-open-service-selector" : "openServiceSelector"
		},
		openServiceSelector: function() {
			var self = this;
			this.attrModel.loadServiceSuggestions().then(function(){
				var selectorView = new ServiceSelectorView({
					attrModel: self.attrModel,
					value: self.value
				});
				selectorView.on("change", function(value) {
					self.$el.find("input[type=text]").val(self.value = value);
					self.trigger("change", value);
				});
				selectorView.render();
			});
		},
		render: function() {
			viewfactory = require("viewfactory");
			this.$el.empty().append(viewfactory.loadTemplate("tmpl-service-attribute")({
				value: this.value,
				nullable: this.nullable,
				deletable: this.deletable
			}));
			return this.$el;
		}
	});
	
	return ServiceAttributeView;
});