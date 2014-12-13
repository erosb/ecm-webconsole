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
	
	function getPrimitiveValue(valueArr) {
		if (valueArr == undefined || valueArr.length === 0) {
			return "";
		}
		return valueArr[0];
	}
	
	var MultiplePrimitiveAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.subviews = [];
			this.maxOccurences = options.maxOccurences;
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
			if (this.maxOccurences === "unbound" || this.maxOccurences > this.subviews.length) {
				this.$el.append("<li><input type='button' value='new entry'/></li>");
			}
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
				var $checkbox = new SingularCheckboxAttributeView({value: self.values.indexOf(value) > -1});
				$checkbox.on("change", (function(value) {
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
				this.$el.append($checkbox.render()).append(text).append("<br>");
			}
			return this.$el;
		}
	});
	
	var SingularCheckboxAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.value = options.value;
			this.nullable = options.nullable;
		},
		tagName: "span",
		events: {
			"click .checkbox": "triggerChange",
			"click .btn-null": "setToNull"
		},
		triggerChange: function() {
			this.value = !this.value;
			this.render();
			this.trigger("change", this.value);
		},
		setToNull: function() {
			this.value = null;
			this.render();
			this.trigger("change", this.value);
		},
		render: function() {
			this.$el.empty();
			var $dom = $(loadTemplate("tmpl-threestate-checkbox")({nullable: this.nullable}));
			var $checkbox = $dom.find(".checkbox");
			if (this.value === true) {
				$checkbox.addClass("ui-icon-check");
			} else if (this.value === false) {
				$checkbox.addClass("ui-treeview-emptyicon");
			} else {
				$checkbox.addClass("ui-icon-minus ui-state-disabled");
			}
			this.$el.append($dom);
			return this.$el;
		}
	});
	
	
	var SingularPrimitiveAttributeView = Backbone.View.extend({
		initialize: function(options) {
			this.inputType = options.inputType;
			this.value = options.value;
			this.nullable = options.nullable; 
		},
		tagName: "div",
		attributes: {
			style: "width: 99%"
		},
		events : {
			"blur input[name=value]" : "valueChanged",
			"click .btn-null": "setToNull",
		},
		valueChanged: function() {
			var $input = this.$el.find("input[name=value]");
			this.value = $input.val();
			if (this.value === "") {
				this.render();
			}
			this.trigger("change", this.value);
		},
		setToNull: function() {
			this.trigger("change", this.value = null);
			this.render();
		},
		render: function() {
			var self = this;
			this.$el.empty().append(loadTemplate("tmpl-singular-primitive")({
				nullable: this.nullable,
				value: this.value === null ? "" : this.value,
				placeholder: this.value === null ? "null" : "empty string", 
				type: this.inputType
			}));
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
			for (var name in this.options) {
				var optValue = this.options[name];
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
	
	function createViewForSingularAttribute(attrModel, value, nullable) {
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
				value: value,
				nullable: nullable
			});
		} else {
			var inputType = type.baseType === "password" ? "password" : "text";
			return new SingularPrimitiveAttributeView({
				value: value,
				inputType: inputType,
				nullable: nullable
			});
		}
	}
	
	/**
	 * Factory function for creating input rows for the given configurable attribute 
	 */
	function createViewForAttribute(attrModel) {
		var type = attrModel.get("type");
		if (type.maxOccurences === 0 || type.maxOccurences === 1) {
			var rval = createViewForSingularAttribute(attrModel,
					getPrimitiveValue(attrModel.get("value")),
					type.maxOccurences === 1);
			rval.on("change", function(value) {
				attrModel.set("value", [value]);
			});
			return rval;
		} else {
			if (attrModel.hasOptions()) {
				return new CheckboxListView({model: attrModel,
					values: attrModel.get("value")
				});
			} else {
				return new MultiplePrimitiveAttributeView({
					model: attrModel,
					maxOccurences: type.maxOccurences
				});
			}
		}
		throw new Error("unsupported type: " + JSON.stringify(type));
	}
	
	ecmconfig.createViewForAttribute = createViewForAttribute;
	
})(window.ecmconfig);
});