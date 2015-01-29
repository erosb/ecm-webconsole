/**
 * This file is part of Everit - Service Suggestion SCR implementation for the Webconsole ECM Configuration.
 *
 * Everit - Service Suggestion SCR implementation for the Webconsole ECM Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Service Suggestion SCR implementation for the Webconsole ECM Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Service Suggestion SCR implementation for the Webconsole ECM Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.everit.osgi.webconsole.suggestion.scr;

import org.everit.osgi.webconsole.suggestion.ServiceSuggestionProvider;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

public class Activator implements BundleActivator {

    private ServiceRegistration<ServiceSuggestionProvider> registration;

    @Override
    public void start(final BundleContext context) throws Exception {
        registration = context.registerService(ServiceSuggestionProvider.class, new ScrServiceSuggestionProvider(
                context), null);
    }

    @Override
    public void stop(final BundleContext context) throws Exception {
        registration.unregister();
    }

}
