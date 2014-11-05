/**
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
package org.everit.osgi.ecm.webconsole.configuration;

import java.util.Map;

import org.json.JSONWriter;
import org.osgi.service.cm.ConfigurationAdmin;

/**
 * Represents something which may be configured through a {@link ConfigurationAdmin} service.
 */
public class Configurable {

    private String pid;

    private String location;

    private String factoryPid;

    private Map<String, ConfigurableAttribute> attributes;

    public Map<String, ConfigurableAttribute> getAttributes() {
        return attributes;
    }

    public String getFactoryPid() {
        return factoryPid;
    }

    public String getLocation() {
        return location;
    }

    public String getPid() {
        return pid;
    }

    public void setAttributes(final Map<String, ConfigurableAttribute> attributes) {
        this.attributes = attributes;
    }

    public void setFactoryPid(final String factoryPid) {
        this.factoryPid = factoryPid;
    }

    public void setLocation(final String location) {
        this.location = location;
    }

    public void setPid(final String pid) {
        this.pid = pid;
    }

    public void toJSON(final JSONWriter writer) {

    }

}
