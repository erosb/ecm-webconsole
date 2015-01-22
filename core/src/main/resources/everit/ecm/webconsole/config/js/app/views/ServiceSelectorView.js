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
define([ "backbone", "jquery", "tablesorter" ], function(Backbone, $) {
	"use strict";

	var ServiceSelectorView = Backbone.View.extend({
		initialize : function(options) {
			this.attrModel = options.attrModel;
			this.value = options.value;
			this.attrModel.on("change:displayedService", this.displayProperties, this);
			this.attrModel.on("change:services change:queryError", this.render, this);
		},
		events: {
			"change select[name=matching-services]" : "changeDisplayedService",
			"submit .cnt-filter" : "filterServices",
			"dblclick [name=matching-services]" : "serviceSelectedFromList",
			"keyup" : "keyPressed"
		},
		keyPressed: function(e) {
			if (e.ctrlKey && e.keyCode === 13) { // ctrl+enter
				this.saveAndClose();
			} else if (e.keyCode === 13 && e.target.getAttribute("name") === "matching-services") {
				this.serviceSelectedFromList();
			} else if (e.keyCode === 38) {  // up arrow
				this.attrModel.prevDisplayedService();
			} else if (e.keyCode === 40) { // down arrow
				this.attrModel.nextDisplayedService();
			}
		},
		saveAndClose: function() {
			this.trigger("change", this.filterInput().val());
			this.$el.dialog("close");
		},
		serviceSelectedFromList: function() {
			var serviceId = this.$("[name=matching-services]").val();
			var pid = this.attrModel.getServicePropertyValue(serviceId, "service.pid");
			if (pid !== null) {
				this.filterInput().val("(service.pid=" + pid + ")");
			}
		},
		changeDisplayedService : function(e) {
			var serviceId = $(e.target).val();
			this.attrModel.setDisplayedServiceById(serviceId);
		},
		filterServices : function() {
			this.attrModel.loadServiceSuggestions(this.value = this.filterInput().val());
			return false;
		},
		filterInput : function() {
			return this.$el.find(".cnt-filter input[type=text]");
		},
		displayProperties : function() {
			var viewfactory = require("viewfactory");
			var service = this.attrModel.get("displayedService");
			if (service) {
				$("[name=matching-services]").val(service.id);
			}
			var properties = service ? service.properties : {};
			var dom = viewfactory.handlebarsTpl("tmpl-service-properties")(({properties : properties}));
			this.$(".cnt-service-properties").empty().html(dom).tablesorter();
		},
		render : function() {
			var viewfactory = require("viewfactory");
			var dom = viewfactory.handlebarsTpl("tmpl-service-selector")({
				queryError : this.attrModel.get("queryError"),
				filter : this.attrModel.get("value"),
				services: this.attrModel.get("services")
			});
			this.$el.html(dom);
			this.displayProperties();
			var self = this;
			var title = "Service Selector: " +
				this.attrModel.get("parentService").get("pid") + "." +
				this.attrModel.get("id");
			this.$el.dialog({
				title : title,
				modal : true,
				width : "auto",
				buttons : {
					"Ok" : function() {
						self.saveAndClose();
					},
					"Close" : function() {
						self.$el.dialog("close");
					}
				}
			}).find("table").tablesorter({
				headers : {
					0 : {sorter : false},
					1 : {sorter : false}
				}
			});
			this.filterInput().val(this.value).autocomplete({
				source: function(request, response) {
					response(self.attrModel.autocomplete(request.term));
				},
				delay: 0
			});
			this.filterInput().focus();
		}
	});

	return ServiceSelectorView;
});