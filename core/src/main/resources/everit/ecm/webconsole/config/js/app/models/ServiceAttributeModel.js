define(["AttributeModel", "jquery"], function(AttributeModel, $) {
	
	var ServiceAttributeModel = ecmconfig.AttributeModel.extend({
		suggestionsForValuePrefix: function(value, key, valuePrefix) {
			var lastOpeningParenIdx = value.lastIndexOf("(");
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
							if (new String(val).indexOf(valuePrefix) === 0) {
								matchingValues.push(val); 
							}
						});
					} else  {
						if (new String(prop.value).indexOf(valuePrefix) === 0) {
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
			var url = ecmconfig.rootPath + "/suggestion.json"
				+ "?configAdminPid=" + service.getConfigAdminPid()
				+ "&pid=" + service.get("pid")
				+ "&attributeId=" + this.get("id");
			if (ldapQuery) {
				url += "&query=" + encodeURIComponent(ldapQuery);
			}
			return $.getJSON(url)
			.then(function(data){
				console.log("returned ", data)
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