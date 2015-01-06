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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Dictionary;
import java.util.Hashtable;

import javax.servlet.Servlet;

import org.everit.osgi.ecm.webconsole.configuration.suggestion.AggregateServiceSuggestionProvider;
import org.everit.osgi.ecm.webconsole.configuration.suggestion.ScrServiceSuggestionProvider;
import org.everit.osgi.ecm.webconsole.configuration.suggestion.ServiceSuggestionProvider;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigActivator implements BundleActivator {

    private Collection<ServiceRegistration<?>> registrations;

    private Collection<ServiceTracker<?, ?>> trackers;

    private ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    private ServiceTracker<MetaTypeService, MetaTypeService> metaTypeSrvTracker;

    private ServiceTracker<ServiceSuggestionProvider, ServiceSuggestionProvider> suggestionProviderTracker;

    private void initServiceTrackers(final BundleContext context) {
        trackers.add(cfgAdminTracker = new ServiceTracker<ConfigurationAdmin, ConfigurationAdmin>(context,
                ConfigurationAdmin.class, null));
        trackers.add(metaTypeSrvTracker = new ServiceTracker<MetaTypeService, MetaTypeService>(
                context, MetaTypeService.class, null));
        trackers.add(suggestionProviderTracker = new ServiceTracker<ServiceSuggestionProvider, ServiceSuggestionProvider>(
                context, ServiceSuggestionProvider.class, null));
        trackers.stream().forEach(ServiceTracker::open);
    }

    private void registerDefaultSuggestionProviders(final BundleContext context) {
        registrations.add(context.registerService(ServiceSuggestionProvider.class, new ScrServiceSuggestionProvider(
                context), null));
    }

    public void registerServlet(final BundleContext context, final ConfigManager configManager) {
        Dictionary<String, String> props = new Hashtable<String, String>(2);
        props.put("felix.webconsole.label", ConfigServlet.CONFIG_LABEL);
        ConfigServlet servlet = new ConfigServlet(configManager);
        registrations.add(context.registerService(Servlet.class, servlet, props));
    }

    @Override
    public void start(final BundleContext context) throws Exception {
        registrations = new ArrayList<>(2);
        trackers = new ArrayList<>(3);
        registerDefaultSuggestionProviders(context);
        initServiceTrackers(context);
        ConfigManager configManager = new ConfigManager(cfgAdminTracker, new AggregateServiceSuggestionProvider(
                suggestionProviderTracker), metaTypeSrvTracker, context);
        registerServlet(context, configManager);
    }

    @Override
    public void stop(final BundleContext context) throws Exception {
        trackers.stream().forEach(ServiceTracker::close);
        registrations.stream().forEach(ServiceRegistration::unregister);
    }

}
