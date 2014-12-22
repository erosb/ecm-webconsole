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

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.json.JSONWriter;

public class ServiceSuggestion {

    private final String serviceClass;

    private String serviceId;

    private final Map<String, Object> serviceProperties = new HashMap<>();

    public ServiceSuggestion(final String serviceClass) {
        this.serviceClass = Objects.requireNonNull(serviceClass, "serviceClass cannot be null");
    }

    public ServiceSuggestion property(final String key, final Object value) {
        serviceProperties.put(key, value);
        return this;
    }

    public ServiceSuggestion serviceId(final String serviceId) {
        this.serviceId = Objects.requireNonNull(serviceId, "serviceId cannot be null");
        return this;
    }

    public void toJSON(final JSONWriter writer) {
        writer.object();
        writer.key("serviceClass");
        writer.value(serviceClass);
        writer.key("id");
        writer.value(serviceId);
        writer.key("properties");
        writer.array();
        for (String key : serviceProperties.keySet()) {
            writer.object();
            writer.key("key");
            writer.value(key);
            writer.key("value");
            writer.value(serviceProperties.get(key));
            writer.endObject();
        }
        writer.endArray();
        writer.endObject();
    }

}
