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
		backboneKeys: ecmconfig.rootPath + "/lib/backbone.keys",
		underscore: ecmconfig.rootPath + "/lib/underscore-min",
		jquery: "/system/console/res/lib/jquery-1.8.3",
		jqueryUi: "/system/console/res/lib/jquery-ui-1.9.2",
		tablesorter: "/system/console/res/lib/jquery.tablesorter-2.0.3",
		ractive: ecmconfig.rootPath + "/lib/ractive.min",
		// app models
		ApplicationModel: ecmconfig.rootPath + "/app/models/ApplicationModel",
		AttributeList: ecmconfig.rootPath + "/app/models/AttributeList",
		AttributeModel: ecmconfig.rootPath + "/app/models/AttributeModel",
		ConfigAdminModel: ecmconfig.rootPath + "/app/models/ConfigAdminModel",
		ConfigAdminList: ecmconfig.rootPath + "/app/models/ConfigAdminList",
		ManagedServiceList: ecmconfig.rootPath + "/app/models/ManagedServiceList",
		ManagedServiceModel: ecmconfig.rootPath + "/app/models/ManagedServiceModel",
		ServiceSuggestionModel: ecmconfig.rootPath + "/app/models/ServiceSuggestionModel",
		ServiceAttributeModel: ecmconfig.rootPath + "/app/models/ServiceAttributeModel",
		// app views
		viewfactory: ecmconfig.rootPath + "/app/views/viewfactory",
		AttributeListView: ecmconfig.rootPath + "/app/views/AttributeListView",
		CheckboxListView: ecmconfig.rootPath + "/app/views/CheckboxListView",
		ConfigurationDeletionView: ecmconfig.rootPath + "/app/views/ConfigurationDeletionView",
		ConfigAdminListView: ecmconfig.rootPath + "/app/views/ConfigAdminListView",
		ManagedServiceFactoryRowView: ecmconfig.rootPath + "/app/views/ManagedServiceFactoryRowView",
		ManagedServiceListView: ecmconfig.rootPath + "/app/views/ManagedServiceListView",
		ManagedServiceRowView: ecmconfig.rootPath + "/app/views/ManagedServiceRowView",
		MultiplePrimitiveAttributeView: ecmconfig.rootPath + "/app/views/MultiplePrimitiveAttributeView",
		ServiceAttributeView: ecmconfig.rootPath + "/app/views/ServiceAttributeView",
		ServiceFilterView: ecmconfig.rootPath + "/app/views/ServiceFilterView",
		ServiceSelectorView: ecmconfig.rootPath + "/app/views/ServiceSelectorView",
		SingularCheckboxAttributeView: ecmconfig.rootPath + "/app/views/SingularCheckboxAttributeView",
		SingularPrimitiveAttributeView: ecmconfig.rootPath + "/app/views/SingularPrimitiveAttributeView",
		SingularSelectAttributeView: ecmconfig.rootPath + "/app/views/SingularSelectAttributeView",
	}
});
define([
	"backbone",
	"jquery",
	"ManagedServiceList",
	"ApplicationModel",
	"ConfigAdminListView",
	"ServiceFilterView",
	"ManagedServiceListView"
], function(Backbone, $, ManagedServiceList, ApplicationModel, ConfigAdminListView, ServiceFilterView,
	ManagedServiceListView) {
	
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
	
	new ConfigAdminListView({
		el: document.getElementById("cnt-configadmin-list"),
		model: appModel
	}).render();
	
	new ServiceFilterView({
		el: document.getElementById("cnt-servicefilter"),
		model: appModel
	}).render();
	
	$("#cnt-main").append(new ManagedServiceListView({
		model: managedServiceList,
		appModel: appModel
	}).render());
	
	Backbone.history.start({
		pushState: true,
		root: ecmconfig.rootPath
	});
	
});

	
	
	
