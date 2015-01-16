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
define([
	"backbone",
	"jquery",
	"AttributeList",
	"AttributeModel",
	"ServiceAttributeModel"
], function(Backbone, $, AttributeList, AttributeModel, ServiceAttributeModel) {

	var ManagedServiceModel = Backbone.Model.extend({
		initialize: function() {
			this.set("attributeList", new AttributeList());
		},
		defaults: {
			name: null,
			bundleName: null,
			description: null,
			location: null,
			pid: null,
			factoryPid: null,
			visible: true
		},
		attributeList: new AttributeList(),
		deleteConfig: function() {
			var self = this;
			var configAdminPid = this.get("appModel").get("selectedConfigAdmin").get("pid");
			return $.ajax(ecmconfig.rootPath + "/configuration.json?pid=" +
					this.get("pid") +
					"&location=" + this.get("location") +
					"&configAdminPid=" + configAdminPid, {
				type: "DELETE",
				dataType: "json"
			}).then(function() {
				if (self.hasFactory()) {
					self.get("appModel").get("managedServiceList").remove(self); 
				}
			});
		},
		hasFactory: function() {
			return this.get("factoryPid") && this.get("pid");
		},
		isFactory: function() {
			return this.get("factoryPid") && !this.get("pid");
		},
		attributeValuesToJSON: function() {
			var rval = {};
			this.get("attributeList").forEach(function(attrModel) {
				rval[attrModel.get("id")] = attrModel.get("value");
			});
			return JSON.stringify(rval);
		},
		saveConfiguration: function() {
			var url = ecmconfig.rootPath + "/configuration.json?configAdminPid=" + this.getConfigAdminPid();
			if (this.isFactory() || this.hasFactory()) {
				url += "&factoryPid=" + this.get("factoryPid");
			} 
			if (!this.isFactory()) {
				url += "&pid=" + this.get("pid");
			}
			var self = this;
			return $.ajax(url, {
				type: "PUT",
				dataType: "json",
				data: this.attributeValuesToJSON()
			}).then(function(data) {
				if (data.pid) {
					self.get("appModel").addNewEntry(data);
				}
			});
		},
		getConfigAdminPid: function() {
			return this.get("appModel").get("selectedConfigAdmin").get("pid");
		},
		loadConfiguration: function() {
			var self = this, pid, factoryPid, location;
			var url = ecmconfig.rootPath + "/configuration.json?configAdminPid=" + this.getConfigAdminPid();
			if ((pid = this.get("pid")) !== null) {
				url +="&pid=" + pid;
			}
			if ((factoryPid = this.get("factoryPid")) !== null) {
				url += "&factoryPid=" + factoryPid; 
			}
			if ((location = this.get("location")) !== null) {
				url += "&location=" + location;
			}
			return $.ajax(url, {
				type: "GET",
				dataType: "json"
			}).then(function(data) {
				var attributes = data.map(function(data) {
					var rval;
					if (data.type.baseType === "service") {
						rval = new ServiceAttributeModel(data);
					} else {
						rval = new AttributeModel(data);
					}
					rval.set("parentService", self);
					return rval;
				});
				self.get("attributeList").reset(attributes);
				self.get("appModel").set("displayedService", self);
				return self.get("attributeList");
			});
		}
	});
	
	return ManagedServiceModel;

});

	