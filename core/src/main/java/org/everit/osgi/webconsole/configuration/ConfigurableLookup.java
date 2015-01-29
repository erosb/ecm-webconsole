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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.service.metatype.ObjectClassDefinition;

public class ConfigurableLookup {

    private final Map<String, Configurable> configurablesByPid = new HashMap<String, Configurable>();

    private final Map<String, Configurable> configurablesByFactoryPid = new HashMap<String, Configurable>();

    private final ConfigurationAdmin configAdmin;

    private final BundleContext bundleCtx;

    private final MetaTypeService metaTypeService;

    public ConfigurableLookup(final ConfigurationAdmin configAdmin,
            final BundleContext bundleCtx, final MetaTypeService metaTypeService) {
        super();
        this.configAdmin = Objects.requireNonNull(configAdmin, "configAdmin cannot be null");
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
        this.metaTypeService = Objects.requireNonNull(metaTypeService, "metaTypeService cannot be null");
    }

    private Collection<Configurable> collectResults() {
        ArrayList<Configurable> rval = new ArrayList<Configurable>(configurablesByPid.size()
                + configurablesByFactoryPid.size());
        rval.addAll(configurablesByPid.values());
        rval.addAll(configurablesByFactoryPid.values());
        Collections.sort(rval);
        return rval;
    }

    private void createConfigurablesByFactoryPids(final Bundle bundle, final MetaTypeInformation metatypeInfo) {
        for (String factoryPid : metatypeInfo.getFactoryPids()) {
            ObjectClassDefinition objClassDef = metatypeInfo.getObjectClassDefinition(factoryPid, null);
            getConfigurableByFactoryPid(factoryPid)
            .setName(objClassDef.getName())
            .setDescription(objClassDef.getDescription())
            .setBundleName(bundle.getHeaders().get("Bundle-Name"));
            createConfigurablesOfFactory(factoryPid, objClassDef);
        }
    }

    private void createConfigurablesByPids(final Bundle bundle, final MetaTypeInformation metatypeInfo) {
        for (String pid : metatypeInfo.getPids()) {
            ObjectClassDefinition objClassDef = metatypeInfo.getObjectClassDefinition(pid, null);
            getConfigurableByPid(pid)
            .setName(objClassDef.getName())
            .setDescription(objClassDef.getDescription())
            .setBundleName(bundle.getHeaders().get("Bundle-Name"));
        }
    }

    private void createConfigurablesOfFactory(final String factoryPid, final ObjectClassDefinition objClassDef) {
        try {
            Configuration[] arr = configAdmin.listConfigurations("(service.factoryPid=" + factoryPid + ")");
            for (Configuration conf : Optional.ofNullable(arr).orElse(new Configuration[0])) {
                String pid = (String) conf.getProperties().get("service.pid");
                getConfigurableByPid(pid)
                .setLocation(conf.getBundleLocation())
                .setFactoryPid(factoryPid)
                .setName(pid)
                .setDescription(objClassDef.getName());
            }
        } catch (IOException | InvalidSyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    private String getBoundBundleName(final Configuration config) {
        if (null == config || config.getBundleLocation() == null) {
            return null;
        }
        return Arrays.stream(bundleCtx.getBundles())
                .filter((bundle) -> bundle.getLocation().equals(config.getBundleLocation()))
                .findFirst().map(Bundle::getSymbolicName).orElse("");
    }

    private Configurable getConfigurableByFactoryPid(final String factoryPid) {
        Configurable rval = configurablesByPid.get(factoryPid);
        if (rval == null) {
            rval = new Configurable();
            rval.setFactoryPid(factoryPid);
            configurablesByPid.put(factoryPid, rval);
        }
        return rval;
    }

    private Configurable getConfigurableByPid(final String pid) {
        Configurable rval = configurablesByPid.get(pid);
        try {
            if (rval == null) {
                Optional<Configuration> conf = Optional.ofNullable(configAdmin.getConfiguration(pid));
                rval = new Configurable();
                rval.setPid(pid);
                conf.map(Configuration::getBundleLocation).ifPresent(rval::setLocation);
                if (conf.isPresent()) {
                    rval.setBoundBundleName(getBoundBundleName(conf.get()));
                }
                configurablesByPid.put(pid, rval);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return rval;
    }

    public Collection<Configurable> lookupConfigurables() {
        for (Bundle bundle : bundleCtx.getBundles()) {
            MetaTypeInformation metatypeInfo = metaTypeService.getMetaTypeInformation(bundle);
            if (metatypeInfo == null) {
                continue;
            }
            createConfigurablesByPids(bundle, metatypeInfo);
            createConfigurablesByFactoryPids(bundle, metatypeInfo);
        }
        return collectResults();
    }
}
