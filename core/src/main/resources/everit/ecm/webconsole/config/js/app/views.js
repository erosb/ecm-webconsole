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
	
	var UnboundPrimitiveAttributeView = Backbone.View.extend({
		initialize: function() {
			this.subviews = [];
			this.listenTo(this.model, "change:value", this.render);
		},
		tagName: "ul",
		events : {
			"click [type=button]" : "buttonClicked"
		},
		buttonClicked: function() {
			var valueArr = this.model.get("value").slice(0);
			valueArr.push("");
			this.model.set("value", valueArr);
		},
		render: function() {
			this.subviews = [];
			this.$el.empty();
			var values = this.model.get("value");
			values.forEach(function(value, index){
				var entryView = createViewForSingularAttribute(this.model, value);
				entryView.on("change", function(newValue) {
					values[index] = newValue;
				});
				this.subviews.push(entryView);
				$("<li></li>").appendTo(this.$el).append(entryView.render());
			}, this);
			this.$el.append("<li><input type='button' value='new entry'/></li>");
			this.$el.sortable();
			return this.$el;
		}
	});
	
	var CheckboxListView = Backbone.View.extend({
		initialize: function(options) {
			this.values = options.values;
		},
		tagName: "div",
		render: function() {
			var self = this;
			var options = this.model.get("type").options;
			for (var text in options) {
				var value = options[text];
				var $checkbox = $('<input type="checkbox" value="' + value + '"/>');
				$checkbox.prop("checked", self.values.indexOf(value) > -1)
					.on("change", (function(value) {
						return function() {
							var values = self.values;
							var idx = values.indexOf(value);
							if (idx > -1) {
								values.splice(idx, 1);
							} else {
								values.push(value);
							}
						};
				})(value));
				this.$el.append($checkbox).append(text).append("<br>");
			}
			return this.$el;
		}
	});
	
	var SingularCheckboxAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.value = !!options.value;
		},
		tagName: "input",
		attributes: {
			type: "checkbox"
		},
		events: {
			"change": "triggerChange"
		},
		triggerChange: function() {
			this.trigger("change", !!this.$el.prop("checked"));
		},
		render: function() {
			this.$el.prop("checked", this.value);
			return this.$el;
		}
	});
	
	
	var SingularPrimitiveAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.inputType = options.inputType;
			this.value = options.value;
		},
		tagName: "input",
		className: "ui-state-default ui-corner-all",
		render: function() {
			var self = this;
			this.$el.attr("value", this.value).attr("type", this.inputType);
			this.$el.on("change", function() {
				self.trigger("change", self.el.value);
			})
			return this.$el;
		}
	});
	
	var SingularSelectAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.options = options.options;
			this.value = options.value;
		},
		tagName: "select",
		className: "ui-state-default ui-corner-all",
		events: {
			"change" : "triggerChange"
		},
		triggerChange: function() {
			this.trigger("change", this.el.value);
		},
		render: function() {
			this.$el.empty();
			for (var optValue in this.options) {
				var name = this.options[optValue];
				var optElem = document.createElement("option");
				optElem.setAttribute("value", optValue);
				if (optValue == this.value) {
					optElem.setAttribute("selected", true);
				}
				optElem.innerHTML = name;
				this.$el.append(optElem);
			}
			return this.$el;
		}
	});
	
	function getPrimitiveValue(valueArr) {
		if (valueArr == undefined || valueArr.length === 0) {
			return "";
		}
		return valueArr[0];
	}
	
	function createViewForSingularAttribute(attrModel, value) {
		var type = attrModel.get("type");
		if (attrModel.hasOptions()) {
			if (type.maxOccurences == 0) {
				return new SingularSelectAttributeView({
					value: value,
					options: type.options 
				});
			} else if (type.maxOccurences === "unbound") {
				return new SingularCheckboxAttributeView({
					value: false
				});
			}
		}
		if (type.baseType === "boolean") {
			return new SingularCheckboxAttributeView({
				value: value
			});
		} else {
			var inputType = type.baseType === "password" ? "password" : "text";
			return new SingularPrimitiveAttributeView({
				value: value,
				inputType: inputType
			});
		}
	}
	
	/**
	 * Factory function for creating input rows for the given configurable attribute 
	 */
	function createViewForAttribute(attrModel) {
		var type = attrModel.get("type");
		if (type.maxOccurences === 0) {
			var rval = createViewForSingularAttribute(attrModel, getPrimitiveValue(attrModel.get("value")));
			rval.on("change", function(value) {
				attrModel.set("value", [value]);
			});
			return rval;
		} else if (type.maxOccurences === "unbound") {
			if (attrModel.hasOptions()) {
				return new CheckboxListView({model: attrModel,
					values: attrModel.get("value")
				});
			} else {
				return new UnboundPrimitiveAttributeView({model: attrModel});
			}
		}
		throw new Error("unsupported type: " + JSON.stringify(type));
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
				$frame.find("td:eq(1)").append(createViewForAttribute(attr).render());
				$tbody.append($frame);
			});
			var model = this.model;
			$el.dialog({
				modal: true,
				width: "80%",
				buttons: {
					"Save" : function() {
						model.saveConfiguration();
					}
				}
			});
		}
	});
	
	var ManagedServiceFactoryRowView = Backbone.View.extend({
		tagName: "tr",
		className: "ui-state-default",
		events: {
			"click td.managedservice-name" : "addNewConfig",
			"click .ui-icon-pencil" : "addNewConfig"
		},
		addNewConfig: function() {
			console.log("adding new config to factory");
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
		className: "ui-state-default",
		events: {
			"click .ui-icon-trash" : "deleteConfig",
			"click td.managedservice-name" : "displayConfig"
		},
		deleteConfig: function() {
			var model = this.model;
			var $dlg = $(loadTemplate("tmpl-confirm-delete-configuration")({
				service: this.model
			}));
			$dlg.dialog({
				modal: true,
				buttons: {
					"Yes" : function() {
						model.deleteConfig(function() {
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
			this.listenTo(this.model, "reset", this.render);
		},
		render: function() {
			this.$el.empty().html($("#tmpl-managed-service-list").text());
			var $tbody = this.$el.find("tbody");
			this.model.topLevelEntries().forEach(function(service) {
				if (service.isFactory()) {
					$tbody.append(new ManagedServiceFactoryRowView({model: service}).render());
					this.model.getInstancesOf(service).forEach(function(inst) {
						$tbody.append(new ManagedServiceRowView({model: inst}).render());
					});
				} else {
					$tbody.append(new ManagedServiceRowView({model: service}).render());
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