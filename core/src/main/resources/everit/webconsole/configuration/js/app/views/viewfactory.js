/*
 * This file is part of Everit - Felix Webconsole Configuration.
 *
 * Everit - Felix Webconsole Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
define([
    "backbone",
    "jquery",
    "underscore",
    "handlebars",
    "SingularSelectAttributeView",
    "SingularCheckboxAttributeView",
    "ServiceAttributeView",
    "SingularPrimitiveAttributeView",
    "CheckboxListView",
    "MultiplePrimitiveAttributeView",
    "NullWrapperView",
    "text!templates"
], function(Backbone, $, _, Handlebars,
		SingularSelectAttributeView,
		SingularCheckboxAttributeView,
		ServiceAttributeView,
		SingularPrimitiveAttributeView,
		CheckboxListView,
		MultiplePrimitiveAttributeView,
		NullWrapperView,
		templates) {
	"use strict";
	
	var parsedTemplates = $(templates);
	
	function getPrimitiveValue(valueArr) {
		if (valueArr === undefined || valueArr.length === 0) {
			return null;
		}
		return valueArr[0];
	}
	
	function createViewForSingularAttribute(attrModel, value, nullable, deletable) {
		var type = attrModel.get("type");
		var rval;
		if (attrModel.hasOptions()) {
			if (type.maxOccurences === 0) {
				rval = new SingularSelectAttributeView({
					value: value,
					options: type.options 
				});
			} else if (type.maxOccurences === "unbound") {
				rval =new SingularCheckboxAttributeView({
					value: false
				});
			}
		} else if (type.baseType === "boolean") {
			rval =new SingularCheckboxAttributeView({
				value: value,
				nullable: nullable
			});
		} else if (type.baseType === "service") {
			rval = new ServiceAttributeView({
				attrModel: attrModel,
				value: value,
				nullable: nullable,
				deletable: deletable
			});
		} else {
			var inputType = type.baseType === "password" ? "password" : "text";
			rval = new SingularPrimitiveAttributeView({
				value: value,
				inputType: inputType,
				nullable: nullable,
				deletable: deletable
			});
		}
		if (nullable) {
			return new NullWrapperView({subview: rval, value: value});
		} else {
			return rval;
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
					type.maxOccurences === 1,
					false);
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
	
	function underscoreTpl(templateId) {
		var source = parsedTemplates.find("#" + templateId).text();
		return _.template(source);
	}
	
	function handlebarsTpl(templateId) {
		var source = parsedTemplates.find("#" + templateId).html();
		var template = Handlebars.compile(source);
		return template;
	}
	
	return {
		createViewForAttribute: createViewForAttribute,
		createViewForSingularAttribute: createViewForSingularAttribute,
		underscoreTpl: underscoreTpl,
		handlebarsTpl: handlebarsTpl
	};
});