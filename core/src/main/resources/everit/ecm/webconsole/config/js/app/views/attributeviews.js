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
			var rval = createViewForSingularAttribute(attrModel, ecmconfig.getPrimitiveValue(attrModel.get("value")));
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
	
	ecmconfig.createViewForAttribute = createViewForAttribute;
	
})(window.ecmconfig);
});