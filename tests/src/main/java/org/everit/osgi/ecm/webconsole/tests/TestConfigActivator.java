/**
 * This file is part of Everit - Felix Webconsole ECM Configuration Integration Tests.
 *
 * Everit - Felix Webconsole ECM Configuration Integration Tests is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole ECM Configuration Integration Tests is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole ECM Configuration Integration Tests.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.everit.osgi.ecm.webconsole.tests;

import java.util.ArrayList;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.List;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

public class TestConfigActivator implements BundleActivator {

    private final List<ServiceRegistration> registrations = new ArrayList<>();

    @Override
    public void start(final BundleContext context) throws Exception {
        for (int i = 1; i <= 10; ++i) {
            DummyService service = new DummyServiceImpl();
            Dictionary<String, Object> properties = new Hashtable<>();
            properties.put("service.pid", "dummyservice" + i);
            properties.put("whateverprop", "asdasd");
            properties.put("counter", i);
            properties.put("even", i % 2 == 0);
            ServiceRegistration registration = context.registerService(DummyService.class.getName(), service,
                    properties);
            registrations.add(registration);
        }
    }

    @Override
    public void stop(final BundleContext context) throws Exception {
        registrations.stream().forEach(ServiceRegistration::unregister);
    }

}
