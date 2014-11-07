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
import java.util.Arrays;
import java.util.Collection;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.osgi.framework.BundleContext;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.metatype.AttributeDefinition;
import org.osgi.service.metatype.MetaTypeService;
import org.osgi.service.metatype.ObjectClassDefinition;

public class AttributeLookup {

    private final ConfigurationAdmin configAdmin;

    private final BundleContext bundleCtx;

    private final MetaTypeService metaTypeService;

    public AttributeLookup(final ConfigurationAdmin configAdmin,
            final BundleContext bundleCtx, final MetaTypeService metaTypeService) {
        this.configAdmin = Objects.requireNonNull(configAdmin, "cfgAdminTracker cannot be null");
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
        this.metaTypeService = Objects.requireNonNull(metaTypeService, "metaTypeSrvTracker cannot be null");
    }

    private DisplayedAttribute createDisplayedAttribute(final AttributeDefinition attrDef,
            final Optional<Configuration> config) {
        DisplayedAttribute rval = new DisplayedAttribute();
        rval.setName(attrDef.getName())
                .setId(attrDef.getID())
                .setDescription(attrDef.getDescription())
                .setType(attrDef.getType())
                .setMaxOccurences(attrDef.getCardinality());
        String[] optionValues = Optional.ofNullable(attrDef.getOptionValues()).orElse(new String[0]);
        String[] optionLabels = Optional.ofNullable(attrDef.getOptionLabels()).orElse(new String[0]);
        if (optionValues.length != optionLabels.length) {
            throw new IllegalArgumentException("attribute definition has " + optionValues.length
                    + " option values but " + optionLabels.length + " option label");
        }
        for (int i = 0; i < optionValues.length; ++i) {
            rval.addOption(optionLabels[i], optionValues[i]);
        }
        config.ifPresent(rval::fetchValue);
        return rval;
    }

    public Collection<DisplayedAttribute> lookupForService(final String servicePid, final String location) {
        try {
            Optional<Configuration> config = Optional.ofNullable(configAdmin.getConfiguration(servicePid, location));
            AttributeDefinition[] attrDefs = Arrays.stream(bundleCtx.getBundles())
                    .map(metaTypeService::getMetaTypeInformation)
                    .filter((metatypeInfo) ->
                            metatypeInfo != null && metatypeInfo.getPids() != null
                                    && Arrays.asList(metatypeInfo.getPids()).contains(servicePid))
                    .findFirst()
                    .orElseThrow(IllegalStateException::new)
                    .getObjectClassDefinition(servicePid, null).getAttributeDefinitions(ObjectClassDefinition.ALL);
            return Arrays.stream(attrDefs)
                    .map((attrDef) -> createDisplayedAttribute(attrDef, config))
                    .sorted()
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
