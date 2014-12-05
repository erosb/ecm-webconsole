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
	
	function loadTemplate(templateId) {
		return _.template($("#" + templateId).text());
	}
	
	
	ecmconfig.getPrimitiveValue = function getPrimitiveValue(valueArr) {
		if (valueArr == undefined || valueArr.length === 0) {
			return "";
		}
		return valueArr[0];
	}
	
	var ConfigurationDeletionView = Backbone.View.extend({
		tagName: "div",
		attributes: {
			title: "Confirm configuration deletion"
		},
		render: function() {
			var model  = this.model, self = this;
				$dlg = $(loadTemplate("tmpl-confirm-delete-configuration")({
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
	
	var AttributeListView = ecmconfig.AttributeListView = Backbone.View.extend({
		tagName: "div",
		attributes: {
			title: "Configuration"
		},
		render: function() {
			var $el = this.$el;
			$el.attr("title", "Configuration of " + this.model.get("name"));
			$el.empty().html(loadTemplate("tmpl-attribute-list")({service: this.model}));
			var $tbody = $el.find("tbody")
			this.model.get("attributeList").forEach(function(attr) {
				var $frame = $(loadTemplate("tmpl-attribute-frame")({model: attr}));
				$frame.find("td:eq(1)").prepend(ecmconfig.createViewForAttribute(attr).render()).css("width", "99%");
				$tbody.append($frame);
			});
			var self = this;
			$el.dialog({
				modal: true,
				width: "90%",
				buttons: {
					"Save" : function(e) {
						self.model.saveConfiguration().then(function() {
							self.$el.dialog("close");
						});
					},
					"Delete" : function() {
						new ConfigurationDeletionView({model: self.model}).render();
					}
				},
				close: function() {
					self.model.get("appModel").set("displayedService", null);
					self.trigger("close");
				}
			});
		}
	});
	
	var ManagedServiceFactoryRowView = Backbone.View.extend({
		initialize: function() {
			this.model.on("change:visible", function() {
				this.$el[this.model.get("visible") ? "show" : "hide"]();
			}, this);
		},
		tagName: "tr",
		className: "ui-state-default managedservice-row",
		events: {
			"click td" : "displayConfig",
		},
		displayConfig: function() {
			this.model.loadConfiguration();
		},
		deleteConfig: function() {
			// nothing to do here
		},
		render: function() {
			var dom = loadTemplate("tmpl-managed-service-factory-row")({service: this.model});
			this.$el.append(dom);
			return this.$el;
		}
	});
	
	var ManagedServiceRowView = ecmconfig.ManagedServiceRowView = ManagedServiceFactoryRowView.extend({
		tagName: "tr",
		className: "ui-state-default managedservice-row",
		events: {
			"click .ui-icon-trash" : "deleteConfig",
			"click td" : "displayConfig"
		},
		deleteConfig: function(e) {
			e.stopPropagation();
			var deletionView = new ConfigurationDeletionView({model: this.model});
			deletionView.on("close", function() {this.trigger("deleted")}, this)
			deletionView.render();
		},
		render: function() {
			var dom = loadTemplate("tmpl-managed-service-row")({service: this.model});
			this.$el.append(dom);
			return this.$el;
		}
	});
	
	var ManagedServiceListView = ecmconfig.ManagedServiceListView = Backbone.View.extend({
		tagName: "table",
		className: "tablesorter nicetable noauto ui-widget",
		initialize: function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "reset add remove", this.render);
			this.listenTo(options.appModel, "change:displayedService", this.showConfigForm);
			this.focusedRowIdx = 0;
			this.activeRowClass = "ui-state-active";
			this.listenTo(options.appModel, "visibleServicesChanged", this.alignFocusedRowIdx);
		},
		attributes: {
			"tabindex": 0
		},
		keys: {
			"up": "moveFocusUp",
			"down": "moveFocusDown",
			"enter": "displayConfig",
			"delete" : "deletePressed"
		},
		deletePressed: function(e) {
			var rowViews = this.getVisibleRowViews();
			if (this.isKeyEventToBeHandled(e)) {
				rowViews[this.focusedRowIdx].deleteConfig(e);
			}
		},
		moveFocusUp: function(e) {
			var rowViews = this.getVisibleRowViews();
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			if (this.focusedRowIdx === 0) {
				return;
			}
			rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			rowViews[--this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		moveFocusDown: function(e) {
			var rowViews = this.getVisibleRowViews();
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			if (this.focusedRowIdx >= rowViews.length - 1) {
				return;
			}
			rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			rowViews[++this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		isKeyEventToBeHandled: function(e) {
			return (e.target == this.rowViews[this.focusedRowIdx]
				|| e.target == this.el);
		},
		alignFocusedRowIdx: function() {
			var visibleServices = this.appModel.getVisibleServices();
			var focusedService = this.rowViews[this.focusedRowIdx].model;
			var indexInVisibles = visibleServices.indexOf(focusedService);
			var isStillVisible = indexInVisibles != -1;
			if (!isStillVisible) {
				this.rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
				this.focusedRowIdx = 0;
			} else {
				this.focusedRowIdx = indexInVisibles; 
			}
		},
		getVisibleRowViews: function() {
			var rval = [];
			for (var i = 0; i < this.rowViews.length; ++i) {
				var rowView = this.rowViews[i];
				if (rowView.$el.is(":visible")) {
					rval.push(rowView);
				}
			}
			return rval;
		},
		showConfigForm: function(appModel, displayedService) {
			if (displayedService) {
				new AttributeListView({model: displayedService}).render();
			} else {
				this.$el.focus();
			}
		},
		displayConfig: function(e) {
			var rowViews = this.getVisibleRowViews();
			if (this.isKeyEventToBeHandled(e)) {
				rowViews[this.focusedRowIdx].displayConfig();
			}
		},
		render: function() {
			this.$el.empty().html($("#tmpl-managed-service-list").text());
			var $tbody = this.$el.find("tbody");
			var rowViews = this.rowViews = [];
			this.model.topLevelEntries().forEach(function(service) {
				if (service.isFactory()) {
					var rowView = new ManagedServiceFactoryRowView({model: service});
					rowViews.push(rowView);
					$tbody.append(rowView.render());
					this.model.getInstancesOf(service).forEach(function(inst) {
						var rowView = new ManagedServiceRowView({model: inst});
						rowViews.push(rowView);
						$tbody.append(rowView.render());
					});
				} else {
					var rowView = new ManagedServiceRowView({model: service});
					rowView.on("deleted", function(){this.$el.focus()}, this)
					rowViews.push(rowView);
					$tbody.append(rowView.render());
				}
			}, this);
			this.$el.tablesorter();
			return this.$el;
		} 
	});
	
	var ConfigAdminListView = ecmconfig.ConfigAdminListView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model.get("configAdminList"), "reset", this.render);
			this.model.on("change:selectedConfigAdmin", this.render, this);
		},
		render: function() {
			this.$el.empty();
			var dom = loadTemplate("tmpl-config-admin-list")({
				configAdmins: this.model.get("configAdminList")
			});
			this.$el.append(dom);
			return this.$el;
		}
	});
	
	var ServiceFilterView = ecmconfig.ServiceFilterView = Backbone.View.extend({
		tagName: "span",
		className: "ui-widget ui-widget-content ui-state-default",
		attributes: {
			"tabindex": 0
		},
		events: {
			"keypress input" : "updateModel"
		},
		updateModel: function() {
			this.model.set("serviceFilter", this.$el.find("input").val());
		},
		render: function() {
			var dom = loadTemplate("tmpl-servicefilter")({serviceFilter: this.model.get("serviceFilter")});
			this.$el.empty().append(dom).find("input").focus();
			return this.$el;
		}
	});

})(window.ecmconfig);
}); 