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
		deleteConfig: function(onSuccess) {
			var configAdminPid = this.get("appModel").get("selectedConfigAdmin").get("pid");
			$.ajax(ecmconfig.rootPath + "/configuration.json?pid="
					+ this.get("pid")
					+ "&location=" + this.get("location")
					+ "&configAdminPid=" + configAdminPid, {
				type: "DELETE",
				dataType: "json",
				success: onSuccess
			});
		},
		loadConfiguration: function(onSuccess) {
			var self = this;
			var configAdminPid = this.get("appModel").get("selectedConfigAdmin").get("pid");
			$.ajax(ecmconfig.rootPath + "/configuration.json?pid="
					+ this.get("pid")
					+ "&location=" + this.get("location")
					+ "&configAdminPid=" + configAdminPid, {
				type: "GET",
				dataType: "json",
				success: function(data) {
					var newAttributes = [];
					data.forEach(function(rawAttr) {
						newAttributes.push(new AttributeModel(rawAttr));
					});
					var attrList = self.get("attributes");
					attrList.reset(newAttributes);
					onSuccess(attrList);
				}
			});
		}
	});
	
	var ManagedServiceList = ecmconfig.ManagedServiceList = Backbone.Collection.extend({
		model: ManagedServiceModel
	});

	var ApplicationModel = ecmconfig.ApplicationModel = Backbone.Model.extend({
		initialize: function(options) {
			var configAdminList = new ConfigAdminList();
			configAdminList.on("reset", this.configAdminListChanged, this);
			this.set("configAdminList", configAdminList);
			this.on("change:selectedConfigAdmin", this.selectedConfigAdminChanged, this);
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
		selectedConfigAdminChanged: function() {
			ecmconfig.router.navigate(this.get("selectedConfigAdmin").get("pid"));
		},
		managedServiceList: null,
		configAdminList: new ConfigAdminList(),
		selectedConfigAdmin: null,
		refreshConfigAdminList: function(onReady) {
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
				var newList = [];
				data.forEach(function(rawService) {
					var managedService = new ManagedServiceModel(rawService);
					managedService.set("appModel", self);
					newList.push(managedService);
				});
				self.get("managedServiceList").reset(newList);
			});
		}
	});

})(window.ecmconfig);
});
