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
import org.apache.felix.scr.annotations.PropertyOption;
import org.apache.felix.scr.annotations.Service;

@Component(name = "org.everit.osgi.ecm.webconsole.tests", metatype = true, policy = ConfigurationPolicy.REQUIRE)
@Properties({
    @Property(name = "stringProp", label = "string property", description = "description of string property",
            value = "default value"),
        @Property(name = "stringProp2", label = "string property (no default value)",
                description = "description of string property2"),
        @Property(name = "nullableStringProp", label = "nullable string",
            description = "optional string with \"set to null\"",
            cardinality = 1),
            @Property(name = "intProp", label = "int property", description = "int property", intValue = 42),
            @Property(name = "flag", label = "flag", description = "boolean flag", boolValue = true),
            @Property(name = "nullableFlag", label = "nullable flag", description = "three-state flag", boolValue = true,
            cardinality = 1),
            @Property(name = "passwordProp", label = "password property", passwordValue = "secret"),
            @Property(name = "someStrings", label = "some strings", value = { "asd", "bsd" }),
            @Property(name = "enumeration", label = "enumeration", options = {
                    @PropertyOption(name = "value1", value = "name1"),
                    @PropertyOption(name = "value2", value = "name2"),
                    @PropertyOption(name = "value3", value = "name3")
            }, value = { "value3" }),
            @Property(name = "checkbox list", label = "checkboxlist", options = {
                    @PropertyOption(name = "optionvalue1", value = "optionname1"),
                    @PropertyOption(name = "optionvalue2", value = "optionname2"),
                    @PropertyOption(name = "optionvalue3", value = "optionname3"),
                    @PropertyOption(name = "optionvalue4", value = "optionname4")
            }, value = { "optionvalue2", "optionvalue3" }),
            @Property(name = "limitedlist", label = "Limited List", description = "list with at most 3 entries",
            cardinality = 3)
})
@Service(TestComponent.class)
public class TestComponent {

    private String stringProp;

    private String passwordProp;

    private int intProp;

    private boolean flag;

    private String enumeration;

    public String getEnumeration() {
        return enumeration;
    }

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

    public void setEnumeration(final String enumeration) {
        this.enumeration = enumeration;
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
