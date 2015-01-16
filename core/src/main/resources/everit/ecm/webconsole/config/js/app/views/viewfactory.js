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
define([
    "backbone",
    "jquery",
    "underscore",
    "SingularSelectAttributeView",
    "SingularCheckboxAttributeView",
    "ServiceAttributeView",
    "SingularPrimitiveAttributeView",
    "CheckboxListView",
    "MultiplePrimitiveAttributeView"
], function(Backbone, $, _,
		SingularSelectAttributeView,
		SingularCheckboxAttributeView,
		ServiceAttributeView,
		SingularPrimitiveAttributeView,
		CheckboxListView,
		MultiplePrimitiveAttributeView) {
	"use strict";
	
	function getPrimitiveValue(valueArr) {
		if (valueArr === undefined || valueArr.length === 0) {
			return null;
		}
		return valueArr[0];
	}
	
	function createViewForSingularAttribute(attrModel, value, nullable, deletable) {
		var type = attrModel.get("type");
		if (attrModel.hasOptions()) {
			if (type.maxOccurences === 0) {
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
		} else if (type.baseType === "service") {
			return new ServiceAttributeView({
				attrModel: attrModel,
				value: value,
				nullable: nullable,
				deletable: deletable
			});
		} else {
			var inputType = type.baseType === "password" ? "password" : "text";
			return new SingularPrimitiveAttributeView({
				value: value,
				inputType: inputType,
				nullable: nullable,
				deletable: deletable
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
	
	function loadTemplate(templateId) {
		return _.template($("#" + templateId).text());
	}
	
	return {
		createViewForAttribute: createViewForAttribute,
		createViewForSingularAttribute: createViewForSingularAttribute,
		loadTemplate: loadTemplate
	};
});