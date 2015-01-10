define([
        "backbone",
        "jquery",
        "AttributeList"
], function(Backbone, $, AttributeList) {

	var ManagedServiceModel = Backbone.Model.extend({
		initialize: function(options) {
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
			this.get("attributeList").forEach(function(attrModel) {
				rval[attrModel.get("id")] = attrModel.get("value");
			});
			return JSON.stringify(rval);
		},
		saveConfiguration: function(onSuccess) {
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
				data.pid && self.get("appModel").addNewEntry(data);
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

	