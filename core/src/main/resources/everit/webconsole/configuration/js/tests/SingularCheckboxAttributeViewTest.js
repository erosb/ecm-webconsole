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
define(["../app/views/SingularCheckboxAttributeView"], function(SingularCheckboxAttributeView) {
	
	return function() {
		QUnit.test("triggering change-to-null event", function(assert) {
			var subject = new SingularCheckboxAttributeView({value: true, nullable: true});
			var triggered = false;
			subject.render();
			subject.on("change", function(){ triggered = true ; });
			console.log(subject.$(".btn-null"))
			subject.$(".btn-null").click();
			assert.ok(triggered);
		})
	}
	
});