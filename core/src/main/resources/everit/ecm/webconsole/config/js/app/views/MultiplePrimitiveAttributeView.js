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
	
	var MultiplePrimitiveAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.subviews = [];
			this.maxOccurences = options.maxOccurences;
			this.listenTo(this.model, "change:value", this.render);
		},
		tagName: "ul",
		events : {
			"click .btn-new-entry" : "buttonClicked"
		},
		buttonClicked: function() {
			var valueArr = this.model.get("value").slice(0);
			valueArr.push("");
			this.model.set("value", valueArr);
		},
		deleteEntry: function(index) {
			this.model.get("value").splice(index, 1);
			this.subviews.splice(index, 1);
			this.render();
		},
		render: function() {
			this.subviews = [];
			this.$el.empty();
			viewfactory = require("viewfactory");
			var values = this.model.get("value"), self = this;
			values.forEach(function(value, index){
				var entryView = viewfactory.createViewForSingularAttribute(this.model, value, true, true);
				entryView.on("change", function(newValue) {
					values[index] = newValue;
				});
				entryView.on("delete", function() {
					self.deleteEntry(index);
				});
				this.subviews.push(entryView);
				$("<li></li>").appendTo(this.$el).append(entryView.render());
			}, this);
			if (this.maxOccurences === "unbound" || this.maxOccurences > this.subviews.length) {
				this.$el.append("<li><span title='new entry' class='ui-widget ui-icon ui-icon-plus btn-new-entry'/></li>");
			}
			return this.$el;
		}
	});
	
	return MultiplePrimitiveAttributeView;
	
});