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
public class Configurable implements Comparable<Configurable> {

    private String pid;

    private String location;

    private String factoryPid;

    private String objectClassName;

    private String description;

    private String bundleName;

    private Map<String, ConfigurableAttribute> attributes;

    @Override
    public int compareTo(final Configurable o) {
        return getDisplayedName().compareTo(o.getDisplayedName());
    }

    public Map<String, ConfigurableAttribute> getAttributes() {
        return attributes;
    }

    public String getBundleName() {
        return bundleName;
    }

    public String getDescription() {
        return description;
    }

    public String getDisplayedName() {
        if (objectClassName == null) {
            return pid;
        } else {
            return objectClassName;
        }
    }

    public String getFactoryPid() {
        return factoryPid;
    }

    public String getLocation() {
        return location;
    }

    public String getObjectClassName() {
        return objectClassName;
    }

    public String getPid() {
        return pid;
    }

    public void setAttributes(final Map<String, ConfigurableAttribute> attributes) {
        this.attributes = attributes;
    }

    public void setBundleName(final String bundleName) {
        this.bundleName = bundleName;
    }

    public void setDescription(final String description) {
        this.description = description;
    }

    public void setFactoryPid(final String factoryPid) {
        this.factoryPid = factoryPid;
    }

    public void setLocation(final String location) {
        this.location = location;
    }

    public void setObjectClassName(final String objectClassName) {
        this.objectClassName = objectClassName;
    }

    public void setPid(final String pid) {
        this.pid = pid;
    }

    public void toJSON(final JSONWriter writer) {
        writer.object();
        writer.key("name");
        writer.value(getDisplayedName());
        writer.key("description");
        writer.value(description);
        writer.key("bundleName");
        writer.value(bundleName);
        writer.key("location");
        writer.value(location);
        writer.key("pid");
        writer.value(pid);
        writer.key("factoryPid");
        writer.value(factoryPid);
        writer.endObject();
    }

}
