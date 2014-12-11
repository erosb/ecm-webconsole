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

    private String boundBundleName;

    @Override
    public int compareTo(final Configurable o) {
        return getDisplayedName().compareTo(o.getDisplayedName());
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        Configurable other = (Configurable) obj;
        if (boundBundleName == null) {
            if (other.boundBundleName != null) {
                return false;
            }
        } else if (!boundBundleName.equals(other.boundBundleName)) {
            return false;
        }
        if (bundleName == null) {
            if (other.bundleName != null) {
                return false;
            }
        } else if (!bundleName.equals(other.bundleName)) {
            return false;
        }
        if (description == null) {
            if (other.description != null) {
                return false;
            }
        } else if (!description.equals(other.description)) {
            return false;
        }
        if (factoryPid == null) {
            if (other.factoryPid != null) {
                return false;
            }
        } else if (!factoryPid.equals(other.factoryPid)) {
            return false;
        }
        if (location == null) {
            if (other.location != null) {
                return false;
            }
        } else if (!location.equals(other.location)) {
            return false;
        }
        if (name == null) {
            if (other.name != null) {
                return false;
            }
        } else if (!name.equals(other.name)) {
            return false;
        }
        if (pid == null) {
            if (other.pid != null) {
                return false;
            }
        } else if (!pid.equals(other.pid)) {
            return false;
        }
        return true;
    }

    private String getDisplayedName() {
        if (name == null) {
            return pid;
        } else {
            return name;
        }
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((boundBundleName == null) ? 0 : boundBundleName.hashCode());
        result = prime * result + ((bundleName == null) ? 0 : bundleName.hashCode());
        result = prime * result + ((description == null) ? 0 : description.hashCode());
        result = prime * result + ((factoryPid == null) ? 0 : factoryPid.hashCode());
        result = prime * result + ((location == null) ? 0 : location.hashCode());
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((pid == null) ? 0 : pid.hashCode());
        return result;
    }

    public Configurable setBoundBundleName(final String boundBundleName) {
        this.boundBundleName = boundBundleName;
        return this;
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
        writer.key("boundBundleName");
        writer.value(boundBundleName);
        writer.endObject();
    }

    @Override
    public String toString() {
        return "Configurable [pid=" + pid + ", location=" + location + ", factoryPid=" + factoryPid + ", name=" + name
                + ", description=" + description + ", bundleName=" + bundleName + ", boundBundleName="
                + boundBundleName + "]";
    }

}
