/**
 * This file is part of Everit - Felix Webconsole ECM Configuration Integration Tests.
 *
 * Everit - Felix Webconsole ECM Configuration Integration Tests is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole ECM Configuration Integration Tests is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole ECM Configuration Integration Tests.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.everit.osgi.ecm.webconsole.tests;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.ConfigurationPolicy;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;

@Component(name = "org.everit.osgi.ecm.webconsole.tests", metatype = true, policy = ConfigurationPolicy.REQUIRE)
@Properties({
        @Property(name = "stringProp", label = "string property", description = "description of string property"),
        @Property(name = "intProp", label = "int property", description = "int property")
})
@Service(TestComponent.class)
public class TestComponent {

    private String stringProp;

    private int intProp;

    public int getIntProp() {
        return intProp;
    }

    public String getStringProp() {
        return stringProp;
    }

    public void setIntProp(final int intProp) {
        this.intProp = intProp;
    }

    public void setStringProp(final String stringProp) {
        this.stringProp = stringProp;
    }

}
