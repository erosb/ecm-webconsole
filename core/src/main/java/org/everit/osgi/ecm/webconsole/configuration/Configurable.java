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

import org.json.JSONWriter;
import org.osgi.service.cm.ConfigurationAdmin;

/**
 * Represents something which may be configured through a {@link ConfigurationAdmin} service.
 */
public class Configurable implements Comparable<Configurable> {

    private String pid;

    private String location;

    private String factoryPid;

    private String name;

    private String description;

    private String bundleName;

    @Override
    public int compareTo(final Configurable o) {
        return getDisplayedName().compareTo(o.getDisplayedName());
    }

    private String getDisplayedName() {
        if (name == null) {
            return pid;
        } else {
            return name;
        }
    }

    public Configurable setBundleName(final String bundleName) {
        this.bundleName = bundleName;
        return this;
    }

    public Configurable setDescription(final String description) {
        this.description = description;
        return this;
    }

    public Configurable setFactoryPid(final String factoryPid) {
        this.factoryPid = factoryPid;
        return this;
    }

    public Configurable setLocation(final String location) {
        this.location = location;
        return this;
    }

    public Configurable setName(final String name) {
        this.name = name;
        return this;
    }

    public Configurable setPid(final String pid) {
        this.pid = pid;
        return this;
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
