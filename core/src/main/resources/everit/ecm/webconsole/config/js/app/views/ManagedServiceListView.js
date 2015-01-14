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
define(["backbone", "backboneKeys", "jquery", "tablesorter", "ManagedServiceRowView",
        "ManagedServiceFactoryRowView",
        "AttributeListView"], function(Backbone, BackboneKeys, $, tablesorter,
		ManagedServiceRowView,
		ManagedServiceFactoryRowView,
		AttributeListView) {
	
	var ManagedServiceListView = Backbone.View.extend({
		tagName: "table",
		className: "tablesorter nicetable noauto ui-widget",
		initialize: function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "reset add remove", this.render);
			this.listenTo(options.appModel, "change:displayedService", this.showConfigForm);
			this.focusedRowIdx = 0;
			this.activeRowClass = "ui-state-active";
			this.listenTo(options.appModel, "change:visibleServices", this.alignFocusedRowIdx);
		},
		attributes: {
			"tabindex": 0
		},
		keys: {
			"up": "moveFocusUp",
			"down": "moveFocusDown",
			"enter": "displayConfig",
			"delete" : "deletePressed"
		},
		deletePressed: function(e) {
			if (this.isKeyEventToBeHandled(e)) {
				var rowViews = this.getVisibleRowViews();
				rowViews[this.focusedRowIdx].deleteConfig(e);
			}
		},
		moveFocusUp: function(e) {
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			var rowViews = this.getVisibleRowViews();
			if (this.focusedRowIdx === 0) {
				return;
			}
			rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			rowViews[--this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		moveFocusDown: function(e) {
			if (!this.isKeyEventToBeHandled(e)) {
				return;
			}
			var rowViews = this.getVisibleRowViews();
			if (this.focusedRowIdx >= rowViews.length - 1) {
				return;
			}
			rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
			rowViews[++this.focusedRowIdx].$el.addClass(this.activeRowClass);
		},
		isKeyEventToBeHandled: function(e) {
			return (e.target == this.rowViews[this.focusedRowIdx]
				|| e.target == this.el);
		},
		alignFocusedRowIdx: function() {
			var visibleServices = this.appModel.getVisibleServices();
			var focusedService = this.rowViews[this.focusedRowIdx].model;
			var indexInVisibles = visibleServices.indexOf(focusedService);
			var isStillVisible = indexInVisibles != -1;
			if (!isStillVisible) {
				this.rowViews[this.focusedRowIdx].$el.removeClass(this.activeRowClass);
				this.focusedRowIdx = 0;
			} else {
				this.focusedRowIdx = indexInVisibles; 
			}
		},
		getVisibleRowViews: function() {
			var rval = [];
			for (var i = 0; i < this.rowViews.length; ++i) {
				var rowView = this.rowViews[i];
				if (rowView.$el.is(":visible")) {
					rval.push(rowView);
				}
			}
			return rval;
		},
		showConfigForm: function(appModel, displayedService) {
			if (displayedService) {
				new AttributeListView({model: displayedService}).render();
			} else {
				this.$el.focus();
			}
		},
		displayConfig: function(e) {
			var rowViews = this.getVisibleRowViews();
			if (this.isKeyEventToBeHandled(e)) {
				rowViews[this.focusedRowIdx].displayConfig();
			}
		},
		render: function() {
			this.$el.empty().html($("#tmpl-managed-service-list").text());
			var $tbody = this.$el.find("tbody");
			var rowViews = this.rowViews = [];
			this.model.topLevelEntries().forEach(function(service) {
				if (service.isFactory()) {
					var rowView = new ManagedServiceFactoryRowView({model: service});
					rowViews.push(rowView);
					$tbody.append(rowView.render());
					this.model.getInstancesOf(service).forEach(function(inst) {
						var rowView = new ManagedServiceRowView({model: inst});
						rowViews.push(rowView);
						$tbody.append(rowView.render());
					});
				} else {
					var rowView = new ManagedServiceRowView({model: service});
					rowView.on("deleted", function(){this.$el.focus()}, this)
					rowViews.push(rowView);
					$tbody.append(rowView.render());
				}
			}, this);
			this.$el.tablesorter();
			return this.$el;
		} 
	});
	
	return ManagedServiceListView;
});