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

	var ConfigRouter = Backbone.Router.extend({
		routes: {
			":configAdminPid/:servicePid" : "showService",
			"*configAdminPid" : "showConfigAdmin"
		}
	});
	
	ecmconfig.router = new ConfigRouter();
	
	var managedServiceList = new ecmconfig.ManagedServiceList();
	
	var appModel = new ecmconfig.ApplicationModel({
		managedServiceList : managedServiceList
	});
	appModel.updateConfigAdminList(ecmconfig.configAdmins);
	
	new ecmconfig.ConfigAdminListView({
		el: document.getElementById("cnt-header"),
		model: appModel
	}).render();
	
	$("#cnt-main").append(new ecmconfig.ManagedServiceListView({
		model: managedServiceList
	}).render());
	
	Backbone.history.start({
		pushState: true,
		root: ecmconfig.rootPath
	});
	
	//appModel.refreshManagedServiceList();
	
})(window.ecmconfig);
});