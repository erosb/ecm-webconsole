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
define(["../app/models/ManagedServiceModel"], function(ManagedServiceModel) {
	
	return function() {
		QUnit.test("hasFactory()", function(assert) {
			var subject = new ManagedServiceModel({pid: 10, factoryPid: 20});
			assert.ok( subject.hasFactory(), "Passed!" );
		});
		QUnit.test("not hasFactory()", function(assert) {
			var subject = new ManagedServiceModel({pid: 10});
			assert.ok( !subject.hasFactory(), "Passed!" );
		});
	};
	
});