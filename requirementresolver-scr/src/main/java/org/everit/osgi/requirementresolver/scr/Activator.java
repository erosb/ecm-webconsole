/**
 * This file is part of Everit - Requirement Resolver - SCR implementation for the Webconsole ECM Configuration.
 *
 * Everit - Requirement Resolver - SCR implementation for the Webconsole ECM Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Requirement Resolver - SCR implementation for the Webconsole ECM Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Requirement Resolver - SCR implementation for the Webconsole ECM Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
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
package org.everit.osgi.requirementresolver.scr;

import org.everit.osgi.requirementresolver.ServiceSuggestionProvider;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

public class Activator implements BundleActivator {

    private ServiceRegistration<?> registration;

    @Override
    public void start(final BundleContext context) throws Exception {
        registration = context.registerService(ServiceSuggestionProvider.class.getCanonicalName(),
                new ScrServiceSuggestionProvider(
                        context), null);
    }

    @Override
    public void stop(final BundleContext context) throws Exception {
        registration.unregister();
    }

}
