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

	var ConfigurationModel = ecmconfig.ConfigurationModel = Backbone.Model.extend({

	});
	
	var ConfigurationList = ecmconfig.ConfigurationList = Backbone.Collection.extend({
		model: ConfigurationModel
	});

	var ConfigAdminModel = ecmconfig.ConfigAminModel = Backbone.Model.extend({
		initialize: function() {
			this.set("configurations", new ConfigurationList());
		},
		pid: null,
		bundleId: null,
		description: null,
		configurations: new ConfigurationList(),
		getConfigurations: function(onSuccess) {
			var configList = this.get("configurations");
			if (configList.length === 0) {
				var url = ecmconfig.rootPath + "/configurations.json?configAdmin=" + this.get("pid");
				var self = this;
				$.getJSON(url, function(data) {
					var newList = [];
					data.forEach(function(rawConfig) {
						newList.push(new ConfigurationModel(rawConfig));
					});
					configList.reset(newList);
					onSuccess(configList);
				});
			} else {
				onSuccess(configList);
			}
		}
	});
	
	var ConfigAdminList = ecmconfig.ConfigAdminList = Backbone.Collection.extend({
		model: ConfigAdminModel
	});
	
	var ManagedServiceModel = ecmconfig.ManagedServiceModel = Backbone.Model.extend({
		
	});
	
	var ManagedServiceList = ecmconfig.ManagedServiceList = Backbone.Collection.extend({
		model: ManagedServiceModel
	});

	var ApplicationModel = ecmconfig.ApplicationModel = Backbone.Model.extend({
		initialize: function(options) {
			var configAdminList = new ConfigAdminList();
			configAdminList.on("reset", this.configAdminListChanged, this);
			this.set("configAdminList", configAdminList);
		},
		configAdminListChanged: function() {
			var configAdminList = this.get("configAdminList");
			var configAdminPid = this.get("selectedConfigAdminPid");
			if (configAdminPid == null
					&& configAdminList.length > 0) {
				this.set("selectedConfigAdmin", configAdminList.at(0));
			} else if (configAdminPid != null) {
				var selectedConfigAdmin = configAdminList.findWhere({pid: configAdminPid});
				this.set("selectedConfigAdmin", selectedConfigAdmin);
			}
		},
		managedServiceList: null,
		configAdminList: new ConfigAdminList(),
		selectedConfigAdminPid: null,
		selectedConfigAdmin: null,
		refreshConfigAdminList: function() {
			var self = this;
			$.getJSON(ecmconfig.rootPath + "/configadmin.json", function(data) {
				var newList = [];
				data.forEach(function(rawConfigAdmin){
					var configAdmin = new ConfigAdminModel(rawConfigAdmin);
					configAdmin.set("appModel", self);
					newList.push(configAdmin);
				});
				self.get("configAdminList").reset(newList);
			});
		},
		refreshManagedServiceList : function() {
			var self = this;
			$.getJSON(ecmconfig.rootPath + "/managedservices.json", function(data) {
				console.log("received: ", data);
				var newList = [];
				data.forEach(function(rawService) {
					var managedService = new ManagedServiceModel(rawService);
					newList.push(managedService);
				});
				self.get("managedServiceList").reset(newList);
			});
		}
	});

})(window.ecmconfig);
});
