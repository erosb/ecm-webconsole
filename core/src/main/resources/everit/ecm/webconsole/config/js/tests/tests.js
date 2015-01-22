require.config({
	paths: {
		"qunit" : "../lib/qunit-1.17.1",
		// libs
		backbone : ecmconfig.rootPath + "/lib/backbone",
		backboneKeys: ecmconfig.rootPath + "/lib/backbone.keys",
		underscore: ecmconfig.rootPath + "/lib/underscore-min",
		jquery: "https://code.jquery.com/jquery-1.11.2.min",
		jqueryUi: "/system/console/res/lib/jquery-ui-1.9.2",
		tablesorter: "/system/console/res/lib/jquery.tablesorter-2.0.3",
		thymol: ecmconfig.rootPath + "/lib/thymol.min",
		handlebars: ecmconfig.rootPath + "/lib/handlebars-v2.0.0",
		text: ecmconfig.rootPath + "/lib/text",
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
		templates: ecmconfig.rootPath + "/app/views/templates.html", 
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

require(["qunit", "../app/models/ManagedServiceModel"], function(QUnit, ManagedServiceModel) {
	
	QUnit.test( "hello test", function( assert ) {
		var subject = new ManagedServiceModel({pid: 10, factoryPid: 20});
		assert.ok( subject.hasFactory(), "Passed!" );
	});
	
	// start QUnit.
	QUnit.load();
	QUnit.start();
	
});