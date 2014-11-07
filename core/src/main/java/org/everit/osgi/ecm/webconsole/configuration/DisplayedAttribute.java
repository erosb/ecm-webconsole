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
import org.osgi.service.cm.Configuration;
import org.osgi.service.metatype.AttributeDefinition;

public class DisplayedAttribute implements Comparable<DisplayedAttribute> {

    private static final Map<Integer, String> codeToTypeName = new HashMap<>();

    static {
        codeToTypeName.put(AttributeDefinition.BOOLEAN, "boolean");
        codeToTypeName.put(AttributeDefinition.BYTE, "byte");
        codeToTypeName.put(AttributeDefinition.CHARACTER, "character");
        codeToTypeName.put(AttributeDefinition.DOUBLE, "double");
        codeToTypeName.put(AttributeDefinition.FLOAT, "float");
        codeToTypeName.put(AttributeDefinition.INTEGER, "integer");
        codeToTypeName.put(AttributeDefinition.LONG, "long");
        codeToTypeName.put(AttributeDefinition.PASSWORD, "password");
        codeToTypeName.put(AttributeDefinition.SHORT, "short");
        codeToTypeName.put(AttributeDefinition.STRING, "string");
    }

    private String id;

    private String type;

    private String name;

    private String description;

    private String[] value;

    private int maxOccurences;

    private final Map<String, Object> options = new HashMap<String, Object>();

    public DisplayedAttribute addOption(final String label, final Object value) {
        options.put(label, value);
        return this;
    }

    @Override
    public int compareTo(final DisplayedAttribute o) {
        return name.compareTo(o.name);
    }

    public void fetchValue(final Configuration config) {
        if (config.getProperties() != null) {
            Object value = config.getProperties().get(id);
            if (value != null) {
                if (value instanceof String) {
                    setValue((String) value);
                }
                System.out.println("found value in config: " + value.getClass().getName() + ": " + value);
            }
        }
    }

    public DisplayedAttribute setDescription(final String description) {
        this.description = description;
        return this;
    }

    public DisplayedAttribute setId(final String id) {
        this.id = id;
        return this;
    }

    public DisplayedAttribute setMaxOccurences(final int maxOccurences) {
        this.maxOccurences = Math.abs(maxOccurences);
        return this;
    }

    public DisplayedAttribute setName(final String name) {
        this.name = name;
        return this;
    }

    public DisplayedAttribute setType(final int type) {
        Objects.requireNonNull(this.type = codeToTypeName.get(type), "type not found by code " + type);
        return this;
    }

    public DisplayedAttribute setValue(final String value) {
        this.value = new String[] { value };
        return this;
    }

    public DisplayedAttribute setValue(final String[] value) {
        this.value = value;
        return this;
    }

    public void toJSON(final JSONWriter writer) {
        writer.object();
        writer.key("name");
        writer.value(name);
        writer.key("description");
        writer.value(description);
        // TODO value
        writer.key("type");
        typeToJSON(writer);
        writer.endObject();
    }

    private void typeToJSON(final JSONWriter writer) {
        writer.object();
        writer.key("baseType");
        writer.value(type);
        writer.key("maxOccurences");
        writer.value(maxOccurences);
        if (!options.isEmpty()) {
            writer.key("options");
            writer.object();
            for (String key : options.keySet()) {
                writer.key(key);
                writer.value(options.get(key));
            }
            writer.endObject();
        }
        writer.endObject();
    }

}
