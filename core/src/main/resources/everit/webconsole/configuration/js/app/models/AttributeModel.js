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
define(["backbone"], function(Backbone) {
	"use strict";

	var AttributeModel = Backbone.Model.extend({
		initialize: function() {
			this.on("change:value", this.updateDirtyFlag, this);
		},
		updateDirtyFlag: function() {
			var parentService = this.get("parentService");
			if (parentService) {
				parentService.set("dirty", true);
			}
		},
		defaults: {
			id: null,
			name: null,
			description: null,
			value: null,
			type: null
		},
		hasOptions: function() {
			return this.get("type").options !== undefined;
		}
	});
	
	return AttributeModel;

});