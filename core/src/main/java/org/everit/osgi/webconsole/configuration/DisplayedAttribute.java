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
package org.everit.osgi.webconsole.configuration;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.json.JSONWriter;
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
        DisplayedAttribute other = (DisplayedAttribute) obj;
        if (description == null) {
            if (other.description != null) {
                return false;
            }
        } else if (!description.equals(other.description)) {
            return false;
        }
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        if (Math.abs(maxOccurences) != Math.abs(other.maxOccurences)) {
            return false;
        }
        if (name == null) {
            if (other.name != null) {
                return false;
            }
        } else if (!name.equals(other.name)) {
            return false;
        }
        if (options == null) {
            if (other.options != null) {
                return false;
            }
        } else if (!options.equals(other.options)) {
            return false;
        }
        if (type == null) {
            if (other.type != null) {
                return false;
            }
        } else if (!type.equals(other.type)) {
            return false;
        }
        if (!Arrays.equals(value, other.value)) {
            return false;
        }
        return true;
    }

    public String getId() {
        return id;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((description == null) ? 0 : description.hashCode());
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + maxOccurences;
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((options == null) ? 0 : options.hashCode());
        result = prime * result + ((type == null) ? 0 : type.hashCode());
        result = prime * result + Arrays.hashCode(value);
        return result;
    }

    private void optionsToJSON(final JSONWriter writer) {
        if (!options.isEmpty()) {
            writer.key("options");
            writer.object();
            for (String key : options.keySet()) {
                writer.key(key);
                writer.value(options.get(key));
            }
            writer.endObject();
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

    public DisplayedAttribute setToService() {
        return setType("service");
    }

    public DisplayedAttribute setType(final int type) {
        Objects.requireNonNull(this.type = codeToTypeName.get(type), "type not found by code " + type);
        return this;
    }

    public DisplayedAttribute setType(final String type) {
        this.type = Objects.requireNonNull(type, "type cannot be null");
        return this;
    }

    public DisplayedAttribute setValue(final Object value) {
        if (value != null) {
            if (value instanceof String) {
                setValue((String) value);
            } else if (value instanceof String[]) {
                setValue((String[]) value);
            } else if (value instanceof Boolean) {
                this.value = new String[] { value.toString() };
            }
        }
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
        writer.key("id");
        writer.value(id);
        writer.key("name");
        writer.value(name);
        writer.key("description");
        writer.value(description);
        writer.key("value");
        valueToJSON(writer);
        writer.key("type");
        typeToJSON(writer);
        writer.endObject();
    }

    @Override
    public String toString() {
        return "DisplayedAttribute [id=" + id + ", type=" + type + ", name=" + name + ", description=" + description
                + ", value=" + Arrays.toString(value) + ", maxOccurences=" + maxOccurences + ", options=" + options
                + "]";
    }

    private void typeToJSON(final JSONWriter writer) {
        writer.object();
        writer.key("baseType");
        writer.value(type);
        writer.key("maxOccurences");
        if (maxOccurences == Integer.MIN_VALUE || maxOccurences == Integer.MAX_VALUE) {
            writer.value("unbound");
        } else {
            writer.value(maxOccurences);
        }
        optionsToJSON(writer);
        writer.endObject();
    }

    private void valueToJSON(final JSONWriter writer) {
        writer.array();
        for (String value : Optional.ofNullable(this.value).orElse(new String[0])) {
            if (type.equals("boolean")) {
                writer.value(value.equals("true"));
            } else {
                writer.value(value);
            }
        }
        writer.endArray();
    }

}
