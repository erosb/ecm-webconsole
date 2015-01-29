/**
 * This file is part of Everit - Service Suggestion API for the Webconsole ECM Configuration.
 *
 * Everit - Service Suggestion API for the Webconsole ECM Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Service Suggestion API for the Webconsole ECM Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Service Suggestion API for the Webconsole ECM Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
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
package org.everit.osgi.webconsole.suggestion;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;

import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.util.tracker.ServiceTracker;

public class AggregateServiceSuggestionProvider implements ServiceSuggestionProvider {

    private final ServiceTracker<ServiceSuggestionProvider, ServiceSuggestionProvider> tracker;

    public AggregateServiceSuggestionProvider(
            final ServiceTracker<ServiceSuggestionProvider, ServiceSuggestionProvider> tracker) {
        this.tracker = Objects.requireNonNull(tracker, "tracker cannot be null");
    }

    @Override
    protected void finalize() throws Throwable {
        tracker.close();
    }

    @Override
    public Collection<ServiceReference<?>> getSuggestions(final String configPid, final String attributeId,
            final String ldapQuery)
                    throws InvalidSyntaxException {
        Collection<ServiceReference<?>> rval = new HashSet<ServiceReference<?>>();
        for (Object obj : Optional.ofNullable(tracker.getServices()).orElse(new Object[] {})) {
            ServiceSuggestionProvider provider = (ServiceSuggestionProvider) obj;
            rval.addAll(provider.getSuggestions(configPid, attributeId, ldapQuery));
        }
        return rval;
    }
}
