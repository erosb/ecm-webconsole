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
define(["backbone", "jquery", "viewfactory", "ConfigurationDeletionView", "jqueryUi"], function(
		Backbone, $, viewfactory, ConfigurationDeletionView) {
	"use strict";
	
	var ConfirmCloseView = Backbone.View.extend({
		initialize: function(options) {
			this.parentView = options.parentView;
		},
		attributes : {
			title: "Confirm closing configuration"
		},
		render: function() {
			var self = this;
			this.$el.html("You have pending changes").dialog({
				modal: true,
				width: "auto",
				buttons: {
					"Discard changes" : function() {
						self.$el.dialog("close");
						self.parentView.forcedClose();
					},
					"Save pending changes" : function() {
						self.$el.dialog("close");
						self.parentView.saveConfig();
					},
					"Cancel" : function() {
						self.$el.dialog("close");
					}
				}
			});
		}
	});

	var AttributeListView = Backbone.View.extend({
		attributes: {
			title: "Configuration"
		},
		events: {
			"keypress" : "keyPressed"
		},
		keyPressed: function(e) {
			if (e.ctrlKey && e.key === "s") {
				this.saveConfig();
				e.stopPropagation();
				e.preventDefault();
			}
		},
		saveConfig: function() {
			var self = this;
			this.model.saveConfiguration().then(function() {
				self.$el.dialog("close");
			});
		},
		forcedClose: function() {
			this.model.set("dirty", false);
			this.$el.dialog("close");
		},
		render: function() {
			var $el = this.$el;
			$el.attr("title", "Configuration of " + this.model.get("name"));
			$el.empty().html(viewfactory.loadTemplate("tmpl-attribute-list")({service: this.model}));
			var $tbody = $el.find("tbody");
			this.model.get("attributeList").forEach(function(attr) {
				var $frame = $(viewfactory.loadTemplate("tmpl-attribute-frame")({model: attr}));
				$frame.find("td:eq(1)").prepend(viewfactory.createViewForAttribute(attr).render()).css("width", "99%");
				$tbody.append($frame);
			});
			var self = this;
			$el.dialog({
				modal: true,
				width: "90%",
				buttons: {
					"Save" : function() {
						self.saveConfig();
					},
					"Delete" : function() {
						var delDlg = new ConfigurationDeletionView({model: self.model});
						delDlg.render();
						delDlg.on("close", function() {
							$el.dialog("close");
						});
					}
				},
				close: function() {
					self.model.get("appModel").set("displayedService", null);
					self.trigger("close");
				},
				beforeClose: function(e) {
					if (self.model.get("dirty")) {
						e.preventDefault();
						new ConfirmCloseView({parentView: self}).render();
					}
				}
			});
		}
	});

	return AttributeListView;
});
