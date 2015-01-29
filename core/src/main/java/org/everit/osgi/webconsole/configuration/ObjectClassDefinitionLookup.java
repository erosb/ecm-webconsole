/**
 * This file is part of Everit - Felix Webconsole Configuration.
 *
 * Everit - Felix Webconsole Configuration is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole Configuration is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole Configuration.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.everit.osgi.webconsole.configuration;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

import org.osgi.framework.BundleContext;
import org.osgi.service.metatype.MetaTypeInformation;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.service.metatype.ObjectClassDefinition;

public class ObjectClassDefinitionLookup {

    private final MetaTypeService metaTypeService;

    private final BundleContext bundleCtx;

    public ObjectClassDefinitionLookup(final MetaTypeService metaTypeService, final BundleContext bundleCtx) {
        this.metaTypeService = Objects.requireNonNull(metaTypeService, "metaTypeService cannot be null");
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
    }

    public ObjectClassDefinition lookup(final String pid, final String factoryPid) {
        Function<MetaTypeInformation, String[]> metatypeInfoToPidArr;
        String metatypeServiceFilteringPid;
        if (factoryPid != null) {
            metatypeInfoToPidArr = MetaTypeInformation::getFactoryPids;
            metatypeServiceFilteringPid = factoryPid;
        } else {
            metatypeInfoToPidArr = MetaTypeInformation::getPids;
            metatypeServiceFilteringPid = pid;
        }
        return Arrays.stream(bundleCtx.getBundles())
                .map(metaTypeService::getMetaTypeInformation)
                .filter((metatypeInfo) -> Optional.ofNullable(metatypeInfo)
                        .map(metatypeInfoToPidArr)
                        .map(Arrays::asList)
                        .filter((list) -> list.contains(metatypeServiceFilteringPid)).isPresent())
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("ObjectClassDefinition not found"))
                .getObjectClassDefinition(metatypeServiceFilteringPid, null);
    }

}
