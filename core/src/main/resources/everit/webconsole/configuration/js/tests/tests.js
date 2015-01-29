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
		"qunit" : "../lib/qunit-1.17.1",
		// libs
		backbone : everitConfig.rootPath + "/../lib/backbone",
		backboneKeys: everitConfig.rootPath + "/../lib/backbone.keys",
		underscore: everitConfig.rootPath + "/../lib/underscore-min",
		jquery: "https://code.jquery.com/jquery-1.11.2.min",
		jqueryUi: "/system/console/res/lib/jquery-ui-1.9.2",
		tablesorter: "https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.18.4/js/jquery.tablesorter.min",
		thymol: everitConfig.rootPath + "/../lib/thymol.min",
		handlebars: everitConfig.rootPath + "/../lib/handlebars-v2.0.0",
		text: everitConfig.rootPath + "/../lib/text",
		// app models
		ApplicationModel: everitConfig.rootPath + "/../app/models/ApplicationModel",
		AttributeList: everitConfig.rootPath + "/../app/models/AttributeList",
		AttributeModel: everitConfig.rootPath + "/../app/models/AttributeModel",
		ConfigAdminModel: everitConfig.rootPath + "/../app/models/ConfigAdminModel",
		ConfigAdminList: everitConfig.rootPath + "/../app/models/ConfigAdminList",
		ManagedServiceList: everitConfig.rootPath + "/../app/models/ManagedServiceList",
		ManagedServiceModel: everitConfig.rootPath + "/../app/models/ManagedServiceModel",
		ServiceSuggestionModel: everitConfig.rootPath + "/../app/models/ServiceSuggestionModel",
		ServiceAttributeModel: everitConfig.rootPath + "/../app/models/ServiceAttributeModel",
		// app views
		templates: everitConfig.rootPath + "/../app/views/templates.html", 
		viewfactory: everitConfig.rootPath + "/../app/views/viewfactory",
		AttributeListView: everitConfig.rootPath + "/../app/views/AttributeListView",
		CheckboxListView: everitConfig.rootPath + "/../app/views/CheckboxListView",
		ConfigurationDeletionView: everitConfig.rootPath + "/../app/views/ConfigurationDeletionView",
		ConfigAdminListView: everitConfig.rootPath + "/../app/views/ConfigAdminListView",
		ManagedServiceFactoryRowView: everitConfig.rootPath + "/../app/views/ManagedServiceFactoryRowView",
		ManagedServiceListView: everitConfig.rootPath + "/../app/views/ManagedServiceListView",
		ManagedServiceRowView: everitConfig.rootPath + "/../app/views/ManagedServiceRowView",
		NullWrapperView: everitConfig.rootPath + "/../app/views/NullWrapperView",
		MultiplePrimitiveAttributeView: everitConfig.rootPath + "/../app/views/MultiplePrimitiveAttributeView",
		ServiceAttributeView: everitConfig.rootPath + "/../app/views/ServiceAttributeView",
		ServiceFilterView: everitConfig.rootPath + "/../app/views/ServiceFilterView",
		ServiceSelectorView: everitConfig.rootPath + "/../app/views/ServiceSelectorView",
		SingularCheckboxAttributeView: everitConfig.rootPath + "/../app/views/SingularCheckboxAttributeView",
		SingularPrimitiveAttributeView: everitConfig.rootPath + "/../app/views/SingularPrimitiveAttributeView",
		SingularSelectAttributeView: everitConfig.rootPath + "/../app/views/SingularSelectAttributeView",
	},
	shim: {
		'qunit': {
			deps: ["jquery"],
			exports: 'QUnit',
			init: function() {
				QUnit.config.autoload = false;
				QUnit.config.autostart = false;
			}
		} 
	}
});

require(["qunit", "ManagedServiceModelTest",
         "SingularCheckboxAttributeViewTest"], function(QUnit, ManagedServiceModelTest, SingularCheckboxAttributeViewTest) {
	
	ManagedServiceModelTest();
	SingularCheckboxAttributeViewTest();
	
	
	// start QUnit.
	QUnit.load();
	QUnit.start();
	
});
