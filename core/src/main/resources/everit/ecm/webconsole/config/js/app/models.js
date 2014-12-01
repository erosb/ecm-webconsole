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
$(document).ready(function() {
(function(ecmconfig) {

	var ConfigAdminModel = ecmconfig.ConfigAminModel = Backbone.Model.extend({
		pid: null,
		bundleId: null,
		description: null,
	});
	
	var ConfigAdminList = ecmconfig.ConfigAdminList = Backbone.Collection.extend({
		model: ConfigAdminModel
	});
	
	var AttributeModel = ecmconfig.AttributeModel = Backbone.Model.extend({
		id: null,
		name: null,
		description: null,
		value: null,
		type: null,
		hasOptions: function() {
			var options = this.get("type").options; 
			return options !== undefined;
		}
	});
	
	var AttributeList = ecmconfig.AttributeList = Backbone.Collection.extend({
		model: AttributeModel
	});
	
	var ManagedServiceModel = ecmconfig.ManagedServiceModel = Backbone.Model.extend({
		initialize: function() {
			this.set("attributes", new AttributeList());
		},
		name: null,
		bundleName: null,
		description: null,
		location: null,
		pid: null,
		factoryPid: null,
		attributes: new AttributeList(),
		deleteConfig: function() {
			var self = this;
			var configAdminPid = this.get("appModel").get("selectedConfigAdmin").get("pid");
			return $.ajax(ecmconfig.rootPath + "/configuration.json?pid="
					+ this.get("pid")
					+ "&location=" + this.get("location")
					+ "&configAdminPid=" + configAdminPid, {
				type: "DELETE",
				dataType: "json"
			}).then(function() {
				self.hasFactory() && self.get("appModel").get("managedServiceList").remove(self);
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
			this.get("attributes").forEach(function(attrModel) {
				rval[attrModel.get("id")] = attrModel.get("value");
			});
			return JSON.stringify(rval);
		},
		saveConfiguration: function(onSuccess) {
			var url = ecmconfig.rootPath + "/configuration.json?configAdminPid=" + this.getConfigAdminPid();
			if (this.isFactory()) {
				url += "&factoryPid=" + this.get("factoryPid");
			} else {
				url += "&pid=" + this.get("pid");
			}
			var self = this;
			return $.ajax(url, {
				type: "PUT",
				dataType: "json",
				data: this.attributeValuesToJSON()
			}).then(function(data) {
				console.log("received", data);
				data.pid && self.get("appModel").addNewEntry(data);
			});
		},
		getConfigAdminPid: function() {
			return this.get("appModel").get("selectedConfigAdmin").get("pid");
		},
		getProp: function(propName, defaultValue) {
			var value = this.get(propName);
			return value === null ? defaultValue : value;
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
				var newAttributes = [];
				data.forEach(function(rawAttr) {
					newAttributes.push(new AttributeModel(rawAttr));
				});
				var attrList = self.get("attributes");
				attrList.reset(newAttributes);
				ecmconfig.router.navigate(self.get("appModel").get("selectedConfigAdmin").get("pid")
						+ "/" + self.get("pid"));
				return attrList;
			});
		}
	});
	
	var ManagedServiceList = ecmconfig.ManagedServiceList = Backbone.Collection.extend({
		model: ManagedServiceModel,
		topLevelEntries: function() {
			return this.filter(function(e) {
				return !e.hasFactory()
			});
		},
		getInstancesOf: function(factoryService) {
			var factoryPid = factoryService.get("factoryPid");
			return this.filter(function(e) {
				return e.get("factoryPid") == factoryPid && e.get("pid") !== null;
			});
		}
	});

	var ApplicationModel = ecmconfig.ApplicationModel = Backbone.Model.extend({
		initialize: function(options) {
			var self = this;
			ecmconfig.router.on("route:showService", function(configAdminPid, servicePid) {
				console.log("TODO showing service", arguments);
				self.set("selectedConfigAdmin", self.get("configAdminList").findWhere({pid: configAdminPid}));
			});
			ecmconfig.router.on("route:showConfigAdmin", function(configAdminPid) {
				var list = self.get("configAdminList");
				var configAdmin = configAdminPid === null ? list.at(0) : list.findWhere({pid: configAdminPid});
				self.set("selectedConfigAdmin", configAdmin);
			});
			var configAdminList = new ConfigAdminList();
			//configAdminList.on("reset", this.configAdminListChanged, this);
			this.set("configAdminList", configAdminList);
			this.on("change:selectedConfigAdmin", this.selectedConfigAdminChanged, this);
		},
		configAdminListChanged: function() {
			var configAdminList = this.get("configAdminList");
			var selectedConfigAdmin = this.get("selectedConfigAdmin");
			var configAdminPid = this.get("selectedConfigAdmin") == null ? null : selectedConfigAdmin.get("pid");
			if (configAdminPid == null
					&& configAdminList.length > 0) {
				this.set("selectedConfigAdmin", configAdminList.at(0));
			}
		},
		selectedConfigAdminChanged: function() {
			var selectedConfigAdmin = this.get("selectedConfigAdmin");
			console.log("selected configadmin changed", selectedConfigAdmin)
			if (selectedConfigAdmin === null || selectedConfigAdmin === undefined) {
				ecmconfig.router.navigate("");
			} else {
				var configAdminPid = this.get("selectedConfigAdmin").get("pid");
				ecmconfig.router.navigate(configAdminPid);
				if (ecmconfig.managedServices !== null
						&& ecmconfig.managedServices[configAdminPid] !== undefined) {
					this.updateManagedServiceList(ecmconfig.managedServices[configAdminPid]);
				} else {
					this.refreshManagedServiceList();
				}
			}
		},
		managedServiceList: null,
		configAdminList: new ConfigAdminList(),
		selectedConfigAdmin: null,
		refreshConfigAdminList: function(onReady) {
			var self = this;
			$.getJSON(ecmconfig.rootPath + "/configadmin.json").then(function(data) {
				self.updateConfigAdminList(data);
			});
		},
		updateConfigAdminList: function(rawConfigAdmins) {
			var newList = [];
			rawConfigAdmins.forEach(function(rawConfigAdmin) {
				var configAdmin = new ConfigAdminModel(rawConfigAdmin);
				configAdmin.set("appModel", self);
				newList.push(configAdmin);
			});
			this.get("configAdminList").reset(newList);
		},
		addNewEntry: function(rawService) {
			this.get("managedServiceList").push(this.createNewEntry(rawService));
		},
		createNewEntry: function(rawService) {
			var managedService = new ManagedServiceModel(rawService);
			managedService.set("appModel", this);
			return managedService;
		},
		updateManagedServiceList: function(data) {
			var newList = [];
			data.forEach(function(rawService) {
				newList.push(this.createNewEntry(rawService));
			}, this);
			this.get("managedServiceList").reset(newList);
		},
		refreshManagedServiceList : function() {
			var self = this, url = ecmconfig.rootPath + "/managedservices.json";
			var selectedConfigAdmin = this.get("selectedConfigAdmin");
			if (selectedConfigAdmin !== null) {
				url += "?configAdminPid=" + selectedConfigAdmin.get("pid"); 
			}
			$.getJSON(url).then(function(data) {
				self.updateManagedServiceList(data);
			});
		}
	});

})(window.ecmconfig);
});
