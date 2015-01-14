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
define(["backbone",
        "ConfigAdminList",
        "ConfigAdminModel",
        "ManagedServiceModel"
], function(Backbone, ConfigAdminList, ConfigAdminModel, ManagedServiceModel) {
	
	var ApplicationModel = ecmconfig.ApplicationModel = Backbone.Model.extend({
		initialize: function(options) {
			var self = this;
			ecmconfig.router.on("route:showService", function(configAdminPid, servicePid) {
				self.set("selectedConfigAdmin", self.get("configAdminList").findWhere({pid: configAdminPid}));
				self.get("managedServiceList").findWhere({pid: servicePid}).loadConfiguration();
			});
			ecmconfig.router.on("route:showFactory", function(configAdminPid, factoryPid) {
				self.set("selectedConfigAdmin", self.get("configAdminList").findWhere({pid: configAdminPid}));
				self.get("managedServiceList").findWhere({factoryPid: factoryPid}).loadConfiguration();
			});
			ecmconfig.router.on("route:showConfigAdmin", function(configAdminPid) {
				var list = self.get("configAdminList");
				var configAdmin = configAdminPid === null ? list.at(0) : list.findWhere({pid: configAdminPid});
				self.set("selectedConfigAdmin", configAdmin);
			});
			var configAdminList = new ConfigAdminList();
			this.set("configAdminList", configAdminList);
			this.on("change:selectedConfigAdmin", this.selectedConfigAdminChanged, this);
			this.on("change:displayedService", this.displayedServiceChanged, this);
			this.on("change:serviceFilter", this.serviceFilterChanged, this);
		},
		defaults: {
			managedServiceList: null,
			configAdminList: new ConfigAdminList(),
			selectedConfigAdmin: null,
			serviceFilter: ""
		},
		serviceFilterChanged: function() {
			var filter = this.get("serviceFilter");
			var regex = new RegExp(".*" + filter.toLowerCase() + ".*", "i");
			this.get("managedServiceList").forEach(function(service) {
				service.set("visible", regex.test(service.get("name")));
			});
			this.trigger("change:visibleServices");
		},
		displayedServiceChanged: function(appModel, displayedService) {
			var url= this.get("selectedConfigAdmin").get("pid");
			if (displayedService !== null) {
				if (displayedService.isFactory()) {
					url += "/new/" + displayedService.get("factoryPid");
				} else {
					url += ("/" + this.get("displayedService").get("pid"));
				}
			}
			ecmconfig.router.navigate(url);
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
		getVisibleServices: function() {
			return this.get("managedServiceList").where({visible: true});
		},
		refreshConfigAdminList: function(onReady) {
			var self = this;
			$.getJSON(ecmconfig.rootPath + "/configadmin.json").then(function(data) {
				self.updateConfigAdminList(data);
			});
		},
		updateConfigAdminList: function(rawConfigAdmins) {
			var newList = rawConfigAdmins.map(function(rawConfigAdmin) {
				var configAdmin = new ConfigAdminModel(rawConfigAdmin);
				configAdmin.set("appModel", self);
				return configAdmin;
			});
			this.get("configAdminList").reset(newList);
		},
		displayedService: null,
		addNewEntry: function(rawService) {
			this.get("managedServiceList").push(this.createNewEntry(rawService));
		},
		createNewEntry: function(rawService) {
			var managedService = new ManagedServiceModel(rawService);
			managedService.set("appModel", this);
			return managedService;
		},
		updateManagedServiceList: function(data) {
			var newList = data.map(function(rawService) {
				return this.createNewEntry(rawService);
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
	
	return ApplicationModel;
});