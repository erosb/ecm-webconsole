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
require.config({
	paths: {
		// libs
		backbone : ecmconfig.rootPath + "/lib/backbone",
		underscore: ecmconfig.rootPath + "/lib/underscore-min",
		jquery: "/system/console/res/lib/jquery-1.8.3",
		// app files
		ApplicationModel: ecmconfig.rootPath + "/app/models/ApplicationModel",
		AttributeList: ecmconfig.rootPath + "/app/models/AttributeList",
		AttributeModel: ecmconfig.rootPath + "/app/models/AttributeModel",
		ConfigAdminModel: ecmconfig.rootPath + "/app/models/ConfigAdminModel",
		ConfigAdminList: ecmconfig.rootPath + "/app/models/ConfigAdminList",
		ManagedServiceList: ecmconfig.rootPath + "/app/models/ManagedServiceList",
		ManagedServiceModel: ecmconfig.rootPath + "/app/models/ManagedServiceModel",
		ServiceSuggestionModel: ecmconfig.rootPath + "/app/models/ServiceSuggestionModel",
		ServiceAttributeModel: ecmconfig.rootPath + "/app/models/ServiceAttributeModel"
	}
});
define([
        "backbone",
        "ManagedServiceList",
        "ApplicationModel"
], function(Backbone, ManagedServiceList, ApplicationModel) {
	
	var ConfigRouter = Backbone.Router.extend({
		routes: {
			":configAdminPid/:servicePid" : "showService",
			":configAdminPid/new/:factoryPid" : "showFactory",
			"*configAdminPid" : "showConfigAdmin"
		}
	});
	ecmconfig.router = new ConfigRouter();
	
	var managedServiceList = new ManagedServiceList();
	
	var appModel = new ApplicationModel({
		managedServiceList : managedServiceList
	});
	
	appModel.updateConfigAdminList(ecmconfig.configAdmins);
	
	new ecmconfig.ConfigAdminListView({
		el: document.getElementById("cnt-configadmin-list"),
		model: appModel
	}).render();
	
	new ecmconfig.ServiceFilterView({
		el: document.getElementById("cnt-servicefilter"),
		model: appModel
	}).render()
	
	$("#cnt-main").append(new ecmconfig.ManagedServiceListView({
		model: managedServiceList,
		appModel: appModel
	}).render());
	
	Backbone.history.start({
		pushState: true,
		root: ecmconfig.rootPath
	});
});

$(document).ready(function() {
(function(ecmconfig) {
	
	
	
	
})(window.ecmconfig);
});