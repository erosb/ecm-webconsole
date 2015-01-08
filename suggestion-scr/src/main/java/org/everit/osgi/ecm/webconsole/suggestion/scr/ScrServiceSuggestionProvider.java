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
package org.everit.osgi.ecm.webconsole.suggestion.scr;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Objects;
import java.util.Optional;

import org.apache.felix.scr.Component;
import org.apache.felix.scr.ScrService;
import org.everit.osgi.ecm.webconsole.suggestion.ServiceSuggestionProvider;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;

public class ScrServiceSuggestionProvider implements ServiceSuggestionProvider {

    private final BundleContext bundleCtx;

    public ScrServiceSuggestionProvider(final BundleContext bundleCtx) {
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
    }

    @Override
    public Collection<ServiceReference<?>> getSuggestions(final String configPid, final String attributeId,
            final String ldapQuery) throws InvalidSyntaxException {
        ScrService scrService = bundleCtx.getService(bundleCtx.getServiceReference(ScrService.class));
        Component component = Arrays.stream(scrService.getComponents())
                .filter((comp) -> comp.getConfigurationPid().equals(configPid))
                .findFirst().orElse(null);
        if (component == null) {
            return Collections.emptyList();
        }
        String referenceClassName = Arrays.stream(component.getReferences())
                .filter((ref) -> (ref.getName() + ".target").equals(attributeId))
                .map((ref) -> ref.getServiceName())
                .findFirst().orElse(null);
        Optional<ServiceReference<?>[]> refs = Optional.ofNullable(bundleCtx.getServiceReferences(referenceClassName,
                ldapQuery));
        return refs.map(Arrays::asList).orElse(Collections.emptyList());
    }

}
