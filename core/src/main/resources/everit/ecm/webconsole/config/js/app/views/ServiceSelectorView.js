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
define(["backbone", "jquery", "ractive"], function(Backbone, $, Ractive) {

	var ServiceSelectorView = Backbone.View.extend({
		initialize: function(options) {
			this.attrModel = options.attrModel;
			this.value = options.value;
		},
		filterServices: function() {
			this.attrModel.loadServiceSuggestions(this.filterInput().val());
			return false;
		},
		filterInput: function() {
			return this.$el.find(".cnt-filter input[type=text]");
		},
		render: function() {
			var self = this;
			var app = new Ractive({
				el: this.el,
				template: "#tmpl-service-selector",
				data: {
					filter: "",
					services: this.attrModel.get("services"),
					displayedService: null
				},
				oninit: function() {
					this.on("change", function(e) {
						var id = e.displayedServiceId;
						if (id !== undefined) {
							var services = this.get("services");
							services.forEach(function(service) {
								if (service.id === id) {
									this.set("displayedService", service);
								}
							}, this);
						}
					});
					this.on("doFilter", function() { self.filterServices(); return false; });
				}
			});
			this.attrModel.on("change:services change:queryError", function() {
				app.set("services", self.attrModel.get("services"));
				app.set("queryError", self.attrModel.get("queryError"));
			});
			var title = "Service Selector: " + this.attrModel.get("parentService").get("pid") +
				"." + this.attrModel.get("id");
			this.$el.dialog({
				title: title,
				modal: true,
				width: "auto",
				buttons: {
					"Ok" : function() {
						self.trigger("change", self.filterInput().val());
						app.teardown();
						self.$el.dialog("close");
					},
					"Close" : function() {
						self.$el.dialog("close");
					}
				}
			}).find("table").tablesorter({
				headers: {
					0: {sorter:false},
					1: {sorter:false},
					2: {sorter:false}
				}
			});
			this.filterInput().val(this.value).autocomplete({
				source: function(request, response) {
					response(self.attrModel.autocomplete(request.term));
				},
				delay: 0
			});
		}
	});
	
	return ServiceSelectorView;
});