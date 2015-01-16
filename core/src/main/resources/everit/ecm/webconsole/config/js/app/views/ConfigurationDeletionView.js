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
define(["backbone", "jquery", "viewfactory"], function(Backbone, $, viewfactory) {
	"use strict";
	
	var ConfigurationDeletionView = Backbone.View.extend({
		tagName: "div",
		attributes: {
			title: "Confirm configuration deletion"
		},
		render: function() {
			var model  = this.model, self = this;
			var $dlg = $(viewfactory.loadTemplate("tmpl-confirm-delete-configuration")({
				service: this.model
			}));
			$dlg.dialog({
				modal: true,
				buttons: {
					"Yes" : function() {
						model.deleteConfig().then(function() {
							$dlg.dialog("close");
						});
					},
					"Cancel" : function() {
						$dlg.dialog("close");
					}
				},
				close: function() {
					self.trigger("close");
				}
			});
		}
	});
	
	return ConfigurationDeletionView;
});