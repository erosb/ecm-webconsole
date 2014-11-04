package org.everit.osgi.ecm.webconsole.configuration;

import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.cm.ManagedService;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigManager {

    private final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    private final BundleContext bundleCtx;

    public ConfigManager(final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker,
            final BundleContext bundleCtx) {
        this.cfgAdminTracker = Objects.requireNonNull(cfgAdminTracker, "cfgAdminTracker cannot be null");
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
    }

    public Stream<ServiceReference<ConfigurationAdmin>> configAdminStream() {
        return Arrays.stream(
                Optional.ofNullable(cfgAdminTracker.getServiceReferences()).orElse(new ServiceReference[0]));
    }

    public void deleteConfiguration(final String servicePid, final String configAdminPid) {
        try {
            ServiceReference<ConfigurationAdmin> cm = configAdminStream().filter((serviceRef)
                    -> serviceRef.getProperty("service.pid").equals(configAdminPid))
                    .findFirst().orElseThrow(IllegalArgumentException::new);
            ConfigurationAdmin configAdmin = bundleCtx.getService(cm);
            configAdmin.getConfiguration(servicePid).delete();
            // System.out.println(String.format("deleting configuration: servicePid = %s, configAdminPid = %s",
            // servicePid,
            // configAdminPid));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public Stream<ServiceReference<ManagedService>> listManagedServices() {
        try {
            return bundleCtx.getServiceReferences(
                    ManagedService.class, null).stream();
        } catch (InvalidSyntaxException e) {
            throw new RuntimeException(e);
        }
    }
}
