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

import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;

public interface ServiceSuggestionProvider {

    /**
     * @param configPid
     * @param attributeId
     *            the attribute ID should be retrieved from an {@link ObjectClassDefinition}
     * @param ldapQuery
     *            should be a valid LDAP query used for filtering the suggested services, or {@code null}
     * @return
     */
    public Collection<ServiceReference<?>> getSuggestions(final String configPid, final String attributeId,
            final String ldapQuery) throws InvalidSyntaxException;

}
