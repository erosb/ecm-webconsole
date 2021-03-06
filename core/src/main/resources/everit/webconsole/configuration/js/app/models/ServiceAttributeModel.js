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
define(["AttributeModel", "jquery", "underscore"], function(AttributeModel, $, _) {
	"use strict";
	
	var ServiceAttributeModel = AttributeModel.extend({
		defaults : {
			displayedService: null
		},
		setDisplayedServiceById: function(serviceId) {
			var services = this.get("services");
			for (var i in services) {
				if (services.hasOwnProperty(i)) {
					var service = services[i];
					if (service.id == serviceId) {
						this.set("displayedService", service);
					}
				}
			}
		},
		getDisplayedServiceIdx: function() {
			var displayedService = this.get("displayedService");
			if (!displayedService) {
				return null;
			}
			var services = this.get("services");
			for (var i in services) {
				if (services[i].id === displayedService.id) {
					return i;
				}
			}
			return null;
		},
		prevDisplayedService: function() {
			var idx = this.getDisplayedServiceIdx();
			if (idx === null) {
				idx = 1;
			}
			--idx;
			if (idx >= 0) {
				this.set("displayedService", this.get("services")[idx]);
			}
		},
		nextDisplayedService: function() {
			var idx = this.getDisplayedServiceIdx();
			if (idx === null) {
				idx = -1;
			}
			++idx;
			if (idx < this.get("services").length) {
				this.set("displayedService", this.get("services")[idx]);
			}
		},
		getServicePropertyValue: function(serviceId, propertyKey) {
			var service = _.findWhere(this.get("services"), {id: serviceId});
			if (service === undefined) {
				return null;
			}
			var props = service.properties;
			for (var i in props) {
				if (props.hasOwnProperty(i)) {
					var prop = props[i];
					if (prop.key === propertyKey) {
						return prop.value;
					}
				}
			}
			return null;
		},
		suggestionsForValuePrefix: function(value, key, valuePrefix) {
			var lastEqIdx = value.lastIndexOf("=");
			var suggestions = [];
			this.get("services").forEach(function(service) {
				service.properties.forEach(function(prop) {
					var matchingValues = [];
					if (prop.key !== key) {
						return;
					}
					if (prop.value instanceof Array) {
						prop.value.forEach(function(val) {
							if (String(val).indexOf(valuePrefix) === 0) {
								matchingValues.push(val); 
							}
						});
					} else  {
						if (String(prop.value).indexOf(valuePrefix) === 0) {
							matchingValues.push(prop.value); 
						}
					}
					matchingValues.forEach(function(val) {
						var candidate = value.substring(0, lastEqIdx + 1) + val + ")";
						if (suggestions.indexOf(candidate) === -1) {
							suggestions.push(candidate);
						}
					});
				});
			});
			return suggestions;
		},
		suggestionsForKeyPrefix: function(value, keyPrefix) {
			var lastOpeningParenIdx = value.lastIndexOf("(");
			var suggestions = [];
			this.get("services").forEach(function(service) {
				service.properties.forEach(function(prop) {
					if (prop.key.indexOf(keyPrefix) === 0) {
						var candidate = value.substring(0, lastOpeningParenIdx + 1) + prop.key;
						if (suggestions.indexOf(candidate) == -1) {
							suggestions.push(candidate);
						}
					}
				});
			});
			return suggestions;
		},
		autocomplete: function(value) {
			var lastOpeningParenIdx = value.lastIndexOf("(");
			var lastEqIdx = value.lastIndexOf("=");
			if (lastOpeningParenIdx > lastEqIdx) {
				var keyPrefix = value.substring(lastOpeningParenIdx + 1, value.length);
				return this.suggestionsForKeyPrefix(value, keyPrefix);
			} else {
				var key = value.substring(lastOpeningParenIdx + 1, lastEqIdx);
				var valuePrefix = value.substring(lastEqIdx + 1, value.length);
				return this.suggestionsForValuePrefix(value, key, valuePrefix);
			}
		},
		loadServiceSuggestions: function(ldapQuery) {
			var service = this.get("parentService"), self = this;
			var url = everitConfig.rootPath + "/suggestion.json" +
				"?configAdminPid=" + service.getConfigAdminPid() +
				"&pid=" + service.get("pid") +
				"&attributeId=" + this.get("id");
			if (ldapQuery) {
				url += "&query=" + encodeURIComponent(ldapQuery);
			}
			return $.getJSON(url)
			.then(function(data){
				if (data.error) {
					self.set("queryError", data.error);
				} else { 
					self.set("services", data);
					self.set("queryError", null);
				}
			});
		}
	});
	
	return ServiceAttributeModel;

});