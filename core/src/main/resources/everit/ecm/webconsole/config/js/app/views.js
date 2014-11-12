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
	
	var SingularCheckboxAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.value = !!options.value;
		},
		tagName: "input",
		attributes: {
			type: "checkbox"
		},
		render: function() {
			this.$el.prop("checked", this.value);
			var self = this;
			this.$el.on("change", function() {
				self.trigger("change", self.$el.prop("checked"));
			});
			return this.$el;
		}
	});
	
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
	
	function getPrimitiveValue(valueArr) {
		if (valueArr == undefined || valueArr.length === 0) {
			return "";
		}
		return valueArr[0];
	}
	
	function createViewForSingularAttribute(attrModel, value) {
		var type = attrModel.get("type");
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
			return createViewForSingularAttribute(attrModel, getPrimitiveValue(attrModel.get("value")));
		} else if (type.maxOccurences === "unbound") {
			return new UnboundPrimitiveAttributeView({model: attrModel});
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
			$el.dialog({
				modal: true
			});
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
			var dom = _.template($("#tmpl-managed-service-row").text())({service: this.model});
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
			this.model.forEach(function(service) {
				var rowView = new ManagedServiceRowView({model: service});
				$tbody.append(rowView.render());
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