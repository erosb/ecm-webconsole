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
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigurationLookup {

    private final Map<String, Configurable> configurablesByPid = new HashMap<String, Configurable>();

    private final Map<String, Configurable> configurablesByFactoryPid = new HashMap<String, Configurable>();

    private final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    private final BundleContext bundleCtx;

    private final ServiceTracker<MetaTypeService, MetaTypeService> metaTypeSrvTracker;

    public ConfigurationLookup(final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker,
            final BundleContext bundleCtx, final ServiceTracker<MetaTypeService, MetaTypeService> metaTypeSrvTracker) {
        super();
        this.cfgAdminTracker = cfgAdminTracker;
        this.bundleCtx = bundleCtx;
        this.metaTypeSrvTracker = metaTypeSrvTracker;
    }

    private Collection<Configurable> collectResults() {
        // TODO Auto-generated method stub
        return null;
    }

    private Configurable getConfigurableByFactoryPid(final String factoryPid) {
        Configurable rval = configurablesByPid.get(factoryPid);
        if (rval == null) {
            rval = new Configurable();
            configurablesByPid.put(factoryPid, rval);
        }
        return rval;
    }

    private Configurable getConfigurableByPid(final String pid) {
        Configurable rval = configurablesByPid.get(pid);
        if (rval == null) {
            rval = new Configurable();
            configurablesByPid.put(pid, rval);
        }
        return rval;
    }

    public Collection<Configurable> lookupConfigurables() {
        MetaTypeService metatypeSrv = metaTypeSrvTracker.getService();
        ConfigurationAdmin configAdmin = cfgAdminTracker.getService();
        for (Bundle bundle : bundleCtx.getBundles()) {
            MetaTypeInformation metatypeInfo = metatypeSrv.getMetaTypeInformation(bundle);
            for (String pid : metatypeInfo.getPids()) {
                Configurable configurable = getConfigurableByPid(pid);
                // Configuration config = configAdmin.getConfiguration(pid, null);
                // configAdmin.
            }
            for (String factoryPid : metatypeInfo.getFactoryPids()) {
                Configurable configurable = getConfigurableByFactoryPid(factoryPid);
            }
        }
        try {
            for (Configuration config : configAdmin.listConfigurations(null)) {
                Configurable configurable = getConfigurableByPid(config.getPid());

            }
        } catch (IOException | InvalidSyntaxException e) {
            throw new RuntimeException(e);
        }
        return collectResults();
    }

}
