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

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Vector;
import java.util.stream.Stream;

import org.apache.felix.scr.Component;
import org.apache.felix.scr.ScrService;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.cm.ManagedService;
import org.osgi.service.metatype.AttributeDefinition;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.service.metatype.ObjectClassDefinition;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigManager {

    private final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    private final BundleContext bundleCtx;

    private final ServiceTracker<MetaTypeService, MetaTypeService> metaTypeSrvTracker;

    public ConfigManager(final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker,
            final ServiceTracker<MetaTypeService, MetaTypeService> metaTypeSrvTracker,
            final BundleContext bundleCtx) {
        this.cfgAdminTracker = Objects.requireNonNull(cfgAdminTracker, "cfgAdminTracker cannot be null");
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
        this.metaTypeSrvTracker = Objects.requireNonNull(metaTypeSrvTracker, "metaTypeSrvTracker cannot be null");
    }

    @SuppressWarnings("unchecked")
    public Stream<ServiceReference<ConfigurationAdmin>> configAdminStream() {
        return Arrays.stream(
                Optional.ofNullable(cfgAdminTracker.getServiceReferences()).orElse(new ServiceReference[0]));
    }

    private Object convertAttributeValue(final List<String> attrValue, final AttributeDefinition attrDef) {
        int cardinality = attrDef.getCardinality();
        validateValueSizeByAttributeCardinality(attrValue, cardinality);
        if (cardinality == 0) {
            if (attrValue.isEmpty()) {
                return null;
            }
            return convertSingleValue(attrValue.get(0), attrDef.getType());
        } else if (cardinality == 1) {
            if (attrValue.isEmpty() || attrValue.get(0) == null) {
                return new String[] {};
            }
            return new String[] { attrValue.get(0) };
        } else if (cardinality == -1) {
            Vector<String> rval = new Vector<String>(1);
            if (!(attrValue.isEmpty() || attrValue.get(0) == null)) {
                rval.add(attrValue.get(0));
            }
            return rval;
        } else if (cardinality < 0) {
            Vector<String> vector = new Vector<String>(attrValue.size());
            for (String rawValue : attrValue) {
                vector.add(convertSingleValue(rawValue, attrDef.getType()));
            }
            return vector;
        } else { /* if (cardinality > 0) */
            String[] arr = new String[attrValue.size()];
            for (int i = 0; i < attrValue.size(); ++i) {
                String rawValue = attrValue.get(i);
                arr[i] = convertSingleValue(rawValue, attrDef.getType());
            }
            return arr;
        }
    }

    private String convertSingleValue(final String rawValue, final int type) {
        // if (type == AttributeDefinition.BOOLEAN) {
        // if (!"true".equals(rawValue)) {
        // return null;
        // }
        // return "true";
        // }
        return rawValue;
        // if (type == AttributeDefinition.STRING || type == AttributeDefinition.PASSWORD) {
        // return rawValue;
        // } else if (type == AttributeDefinition.SHORT) {
        // return Short.valueOf(rawValue);
        // } else if (type == AttributeDefinition.LONG) {
        // return Long.valueOf(rawValue);
        // } else if (type == AttributeDefinition.INTEGER) {
        // return Integer.valueOf(rawValue);
        // } else if (type == AttributeDefinition.CHARACTER) {
        // if (rawValue.length() > 1) {
        // throw new InvalidAttributeValueException("");
        // }
        // return rawValue.charAt(0);
        // } else if (type == AttributeDefinition.BYTE) {
        // return Byte.valueOf(rawValue);
        // } else if (type == AttributeDefinition.DOUBLE) {
        // return Double.valueOf(rawValue);
        // } else if (type == AttributeDefinition.FLOAT) {
        // return Float.valueOf(rawValue);
        // } else if (type == AttributeDefinition.BOOLEAN) {
        // return Boolean.valueOf(rawValue);
        // }
        //
        // throw new IllegalArgumentException("unsupported attribute type: " + type);
    }

    private Map<String, AttributeDefinition> createAttributeMap(final ObjectClassDefinition objClassDef) {
        AttributeDefinition[] attrDefs = objClassDef.getAttributeDefinitions(ObjectClassDefinition.ALL);
        Map<String, AttributeDefinition> rval = new HashMap<>(attrDefs.length);
        for (AttributeDefinition attrDef : attrDefs) {
            rval.put(attrDef.getID(), attrDef);
        }
        return rval;
    }

    public Configurable createConfiguration(final String configAdminPid, final String factoryPid,
            final String location, final Map<String, List<String>> attributes) {
        ConfigurationAdmin configAdmin = getConfigAdmin(configAdminPid);
        try {
            ObjectClassDefinition objClassDef = objectClassDefinitionLookup().lookup(null, factoryPid);
            Configuration newConfig = configAdmin.createFactoryConfiguration(factoryPid, location);
            newConfig.update(mapToProperties(objClassDef, attributes));
            String pid = newConfig.getPid();
            return new Configurable()
            .setPid(pid)
            .setFactoryPid(factoryPid)
            .setName(pid)
            .setDescription(objClassDef.getName());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteConfiguration(final String servicePid, final String location, final String configAdminPid) {
        try {
            ConfigurationAdmin configAdmin = getConfigAdmin(configAdminPid);
            configAdmin.getConfiguration(servicePid, location).delete();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private ConfigurationAdmin getConfigAdmin(final String pid) {
        ServiceReference<ConfigurationAdmin> ref = configAdminStream()
                .filter((serviceRef) -> serviceRef.getProperty("service.pid").equals(pid))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("configadmin (service.pid=" + pid + ") not found"));
        return bundleCtx.getService(ref);
    }

    public Collection<DisplayedAttribute> getConfigForm(final String servicePid, final String factoryPid,
            final String serviceLocation,
            final String configAdminPid) {
        return new AttributeLookup(getConfigAdmin(configAdminPid), bundleCtx, metaTypeService())
                .lookupAttributes(servicePid, factoryPid, serviceLocation);
    }

    public ObjectClassDefinition getObjectClassDefinition(final ServiceReference<ManagedService> serviceRef) {
        MetaTypeService metaTypeSrv = metaTypeService();
        ObjectClassDefinition objClassDef = metaTypeSrv.getMetaTypeInformation(serviceRef.getBundle())
                .getObjectClassDefinition((String) serviceRef.getProperty("service.pid"), null);
        return objClassDef;
    }

    public void getSuggestions(final String configAdminPid, final String pid, final String attributeId) {
        ScrService scrService = bundleCtx.getService(bundleCtx.getServiceReference(ScrService.class));
        Component component = Arrays.stream(scrService.getComponents())
                .filter((comp) -> comp.getConfigurationPid().equals(pid))
                .findFirst().orElse(null);
        if (component == null) {
            return;
        }
        String referenceClassName = Arrays.stream(component.getReferences())
                .filter((ref) -> (ref.getName() + ".target").equals(attributeId))
                .map((ref) -> ref.getServiceName())
                .findFirst().orElse(null);
        System.out.println("referenceClassName = " + referenceClassName);
        try {
            Arrays.stream(bundleCtx.getServiceReferences(referenceClassName, null))
                    .forEach((ref) -> {
                        Object service = bundleCtx.getService(ref);
                        System.out.println("found: " + service.getClass() + " with properties: ");
                        for (String key : ref.getPropertyKeys()) {
                            System.out.println("\t" + key + ": " + ref.getProperty(key));
                        }

                    });
        } catch (InvalidSyntaxException e) {
            throw new RuntimeException(e);
        }

        System.out.println("reference[0]: name: " + component.getReferences()[0].getName() + " serviceName: "
                + component.getReferences()[0].getServiceName());
        // .forEach(
        // (comp) -> {
        // System.out.println("component " + comp.getClassName() + " (pid: "
        // + comp.getConfigurationPid() + ") service name: "
        // + comp.getReferences()[0].getServiceName());
        // });
    }

    public Stream<ServiceReference<ManagedService>> listManagedServices() {
        try {
            return bundleCtx.getServiceReferences(
                    ManagedService.class, null).stream();
        } catch (InvalidSyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public Collection<Configurable> lookupConfigurations() {
        return new ConfigurableLookup(cfgAdminTracker.getService(), bundleCtx, metaTypeService())
                .lookupConfigurables();
    }

    public Collection<Configurable> lookupConfigurations(final String configAdminPid) {
        if (configAdminPid == null) {
            return lookupConfigurations();
        }
        ConfigurationAdmin configAdmin = getConfigAdmin(configAdminPid);
        return new ConfigurableLookup(configAdmin, bundleCtx, metaTypeService()).lookupConfigurables();
    }

    private Dictionary<String, Object> mapToProperties(final ObjectClassDefinition objClassDef,
            final Map<String, List<String>> rawAttributes) {
        Dictionary<String, Object> rval = new Hashtable<String, Object>(rawAttributes.size());
        Map<String, AttributeDefinition> attrDefsByID = createAttributeMap(objClassDef);
        for (String attributeId : rawAttributes.keySet()) {
            List<String> attrValue = rawAttributes.get(attributeId);
            AttributeDefinition attrDef = attrDefsByID.get(attributeId);
            Object propValue = convertAttributeValue(attrValue, attrDef);
            if (propValue != null) {
                rval.put(attributeId, propValue);
            }
        }
        return rval;
    }

    private MetaTypeService metaTypeService() {
        return metaTypeSrvTracker.getService();
    }

    private ObjectClassDefinitionLookup objectClassDefinitionLookup() {
        return new ObjectClassDefinitionLookup(metaTypeSrvTracker.getService(), bundleCtx);
    }

    public void updateConfiguration(final String configAdminPid, final String pid, final String factoryPid,
            final Map<String, List<String>> rawAttributes) {
        ConfigurationAdmin configAdmin = getConfigAdmin(configAdminPid);
        ObjectClassDefinition objClassDef = objectClassDefinitionLookup().lookup(pid, factoryPid);
        try {
            Configuration config = configAdmin.getConfiguration(pid);
            Dictionary<String, ?> properties = mapToProperties(objClassDef, rawAttributes);
            config.update(properties);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void validateValueSizeByAttributeCardinality(final List<String> attrValue, final int cardinality) {
        if (cardinality == Integer.MIN_VALUE || cardinality == Integer.MAX_VALUE) {
            return;
        }
        int absCard = Math.abs(cardinality);
        if (absCard == 0) {
            if (attrValue.size() > 1) {
                throw new InvalidAttributeValueException("expecting at most 1 value, received " + attrValue.size());
            }
        } else {
            if (attrValue.size() > absCard) {
                throw new InvalidAttributeValueException("expecting at most " + absCard + " values, received "
                        + attrValue.size());
            }
        }
    }
}
