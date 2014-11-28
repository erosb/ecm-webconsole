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
			this.model.get("attributes").forEach(function(attr) {
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
					}
				}
			});
		}
	});
	
	var ManagedServiceFactoryRowView = Backbone.View.extend({
		tagName: "tr",
		className: "ui-state-default managedservice-row",
		events: {
			"click td" : "displayConfig",
		},
		displayConfig: function() {
			var model = this.model;
			model.loadConfiguration(function (attrList) {
				new AttributeListView({model: model}).render();
			});
		},
		render: function() {
			var dom = _.template($("#tmpl-managed-service-factory-row").text())({service: this.model});
			this.$el.append(dom);
			return this.$el;
		}
	});
	
	var ManagedServiceRowView = ecmconfig.ManagedServiceRowView = Backbone.View.extend({
		tagName: "tr",
		className: "ui-state-default managedservice-row",
		events: {
			"click .ui-icon-trash" : "deleteConfig",
			"click td" : "displayConfig"
		},
		deleteConfig: function(e) {
			e.stopPropagation();
			var model = this.model;
			var $dlg = $(loadTemplate("tmpl-confirm-delete-configuration")({
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
				}
			});
		},
		displayConfig: function() {
			var model = this.model;
			model.loadConfiguration(function (attrList) {
				new AttributeListView({model: model}).render();
			});
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
			this.listenTo(this.model, "reset add remove", this.render);
			this.focusedRowIdx = 0;
			this.activeRowClass = "ui-state-active";
		},
		attributes: {
			"tabindex": 0
		},
		keys: {
			"up": "moveFocusUp",
			"down": "moveFocusDown",
			"enter": "displayConfig"
		},
		moveFocusUp: function(e) {
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			if (this.focusedRowIdx === 0) {
				return;
			}
			this.rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			this.rowViews[--this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		moveFocusDown: function(e) {
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			if (this.focusedRowIdx >= this.rowViews.length - 1) {
				return;
			}
			this.rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			this.rowViews[++this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		isKeyEventToBeHandled: function(e) {
			return (e.target == this.rowViews[this.focusedRowIdx]
				|| e.target == document.body
				|| e.target == this.el);
		},
		displayConfig: function(e) {
			if (this.isKeyEventToBeHandled(e)) {
				this.rowViews[this.focusedRowIdx].displayConfig();
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
			var dom = _.template($("#tmpl-config-admin-list").text())({
				configAdmins: this.model.get("configAdminList")
			});
			this.$el.append(dom);
			var selectedConfigAdmin = this.model.get("selectedConfigAdmin");
//			if (selectedConfigAdmin != null) {
//				selectedConfigAdmin.getConfigurations(function(config) {
//					console.log("config: ", config);
//				})
//			}
			return this.$el;
		}
	});

})(window.ecmconfig);
});