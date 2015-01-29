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
define(["../app/views/SingularCheckboxAttributeView",
        "../app/views/viewfactory",
        "../app/views/NullWrapperView",
        "../app/models/AttributeModel"], function(SingularCheckboxAttributeView, viewfactory, NullWrapperView, AttributeModel) {
	
	return function() {
		QUnit.test("triggering change-to-null event", function(assert) {
			var subject = new SingularCheckboxAttributeView({value: true, nullable: true});
			var triggered = false;
			subject.render();
			subject.on("change", function(){ triggered = true ; });
			subject.$(".btn-null").click();
			assert.ok(triggered);
		})
		QUnit.test("change from null to true on click", function(assert) {
			var attrModel = new AttributeModel({
				value: [null],
				type : {
					baseType: "boolean",
					maxOccurences: 1
				}
			});
			var view = viewfactory.createViewForAttribute(attrModel);
			view.render();
			view.$el.find(".btn-not-specified").click();
			var $checkbox = view.$el.find(".checkbox");
			assert.ok("checkbox is rendered after clicking the not-specified button", $checkbox.length === 1);
			$checkbox.click();
			$checkbox = view.$el.find(".checkbox");
			assert.ok("checkbox is in checked state after clicking", $checkbox.hasClass("ui-icon-check"));
		})
	}
	
});