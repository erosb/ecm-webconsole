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
define(["backbone", "jquery"], function(Backbone, $) {
	
	function loadTemplate(templateId) {
		return _.template($("#" + templateId).text());
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
			this.model.get("attributeList").forEach(function(attr) {
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
					},
					"Delete" : function() {
						var delDlg = new ConfigurationDeletionView({model: self.model});
						delDlg.render();
						delDlg.on("close", function() {
							$el.dialog("close");
						})
					}
				},
				close: function() {
					self.model.get("appModel").set("displayedService", null);
					self.trigger("close");
				}
			});
		}
	});

	return AttributeListView;
});
