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
    @Property(name = "stringProp", label = "string property", description = "description of string property",
                value = "default value"),
            @Property(name = "intProp", label = "int property", description = "int property", intValue = 42),
            @Property(name = "flag", label = "flag", description = "boolean flag", boolValue = true),
            @Property(name = "passwordProp", label = "password property", passwordValue = "secret"),
            @Property(name = "someStrings", label = "some strings", value = { "asd", "bsd" })
})
@Service(TestComponent.class)
public class TestComponent {

    private String stringProp;

    private String passwordProp;

    private int intProp;

    private boolean flag;

    private String[] someStrings;

    public int getIntProp() {
        return intProp;
    }

    public String getPasswordProp() {
        return passwordProp;
    }

    public String getStringProp() {
        return stringProp;
    }

    public boolean isFlag() {
        return flag;
    }

    public void setFlag(final boolean flag) {
        this.flag = flag;
    }

    public void setIntProp(final int intProp) {
        this.intProp = intProp;
    }

    public void setPasswordProp(final String passwordProp) {
        this.passwordProp = passwordProp;
    }

    public void setStringProp(final String stringProp) {
        this.stringProp = stringProp;
    }

}
