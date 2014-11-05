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
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.cm.ManagedService;
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

    public Stream<ServiceReference<ConfigurationAdmin>> configAdminStream() {
        return Arrays.stream(
                Optional.ofNullable(cfgAdminTracker.getServiceReferences()).orElse(new ServiceReference[0]));
    }

    public void deleteConfiguration(final String servicePid, final String location, final String configAdminPid) {
        try {
            ServiceReference<ConfigurationAdmin> cm = configAdminStream().filter((serviceRef)
                    -> serviceRef.getProperty("service.pid").equals(configAdminPid))
                    .findFirst().orElseThrow(IllegalArgumentException::new);
            ConfigurationAdmin configAdmin = bundleCtx.getService(cm);
            configAdmin.getConfiguration(servicePid, location).delete();
            System.out.println(String.format("deleting configuration: servicePid = %s, configAdminPid = %s",
                    servicePid,
                    configAdminPid));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public ObjectClassDefinition getObjectClassDefinition(final ServiceReference<ManagedService> serviceRef) {
        MetaTypeService metaTypeSrv = metaTypeSrvTracker.getService();
        ObjectClassDefinition objClassDef = metaTypeSrv.getMetaTypeInformation(serviceRef.getBundle())
                .getObjectClassDefinition((String) serviceRef.getProperty("service.pid"), null);
        return objClassDef;
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
        return new ConfigurationLookup(cfgAdminTracker, bundleCtx, metaTypeSrvTracker).lookupConfigurables();
    }

}
