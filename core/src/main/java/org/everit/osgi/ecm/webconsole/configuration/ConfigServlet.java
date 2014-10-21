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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.json.JSONWriter;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.Configuration;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = 1957046444200622859L;

    public static final String CONFIG_LABEL = "ecm-config";

    private static final Set<String> loadableJavascriptFiles = new HashSet<String>(Arrays.asList(
            "app/models.js",
            "app/views.js",
            "config.js",
            "backbone.js",
            "backbone.queryparams.min.js",
            "backbone.queryparams-1.1-shim.js",
            "underscore-min.js"
            ));

    private final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    private final BundleContext bundleCtx;

    public ConfigServlet(final BundleContext bundleCtx,
            final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker) {
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
        this.cfgAdminTracker = Objects.requireNonNull(cfgAdminTracker, "cfgAdminTracker cannot be null");
    }

    private Stream<ServiceReference<ConfigurationAdmin>> configAdminStream() {
        return Arrays.stream(
                Optional.ofNullable(cfgAdminTracker.getServiceReferences()).orElse(new ServiceReference[0]));
    }

    @Override
    public String getCategory() {
        return "Everit";
    }

    @Override
    public String getLabel() {
        return CONFIG_LABEL;
    }

    public URL getResource(final String path) {
        for (String jsFile : loadableJavascriptFiles) {
            if (path.endsWith(jsFile)) {
                return ConfigServlet.class.getResource("/everit/ecm/webconsole/config/js/" + jsFile);
            }
        }
        return null;
    }

    @Override
    public String getTitle() {
        return "ECM configuration";
    }

    @Override
    protected boolean isHtmlRequest(final HttpServletRequest request) {
        return request.getHeader("Accept").indexOf("application/json") == -1;
    }

    private boolean isMainPageRequest(final String pathInfo) {
        return pathInfo.indexOf("/" + CONFIG_LABEL) > -1
                && !(pathInfo.endsWith("css") || pathInfo.endsWith("js") || pathInfo.endsWith("map") || pathInfo
                        .endsWith("json"));
    }

    private void listConfigAdminServices(final HttpServletResponse resp) {
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            writer.array();
            configAdminStream().forEach((confAdmin) -> {
                writer.object();
                writer.key("pid");
                writer.value(confAdmin.getProperty("service.pid"));
                writer.key("description");
                writer.value(confAdmin.getProperty("service.description"));
                writer.key("bundleId");
                writer.value(confAdmin.getBundle().getBundleId());
                writer.endObject();
            });
            writer.endArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void listConfigurationsByConfigAdmin(final HttpServletResponse resp, final String configAdminPid) {
        Configuration[] configs = lookupConfigurationsByConfigAdminPid(configAdminPid);
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            writer.array();
            Arrays.stream(configs).forEach((config) -> {
                writer.object();
                writer.key("pid");
                writer.value(config.getPid());
                writer.endObject();
            });
            writer.endArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void loadMainPage(final HttpServletResponse resp, final String pluginRoot) throws IOException {
        Map<String, String> templateVars = new HashMap<String, String>(1);
        templateVars.put("rootPath", pluginRoot);
        resp.getWriter().println(loadTemplate("/everit/ecm/webconsole/config/template.html", templateVars));
    }

    private String loadTemplate(final String path, final Map<String, String> templateVars) {
        try (InputStream inputStream = ConfigServlet.class.getResourceAsStream(path)) {
            BufferedReader buffInputStream = new BufferedReader(new InputStreamReader(inputStream));
            String line;
            StringBuilder buffer = new StringBuilder();
            while ((line = buffInputStream.readLine()) != null) {
                buffer.append(line);
            }
            String rval = buffer.toString();
            return resolveVariables(rval, templateVars);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Configuration[] lookupConfigurationsByConfigAdminPid(final String configAdminPid) {
        Configuration[] configs = configAdminStream()
                .filter((serviceRef) -> serviceRef.getProperty("service.pid").equals(configAdminPid))
                .map((serviceRef) -> {
                    try {
                        Configuration[] rval = bundleCtx.getService(serviceRef).listConfigurations(null);
                        return rval == null ? new Configuration[0] : rval;
                    } catch (InvalidSyntaxException | IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .findFirst().orElse(new Configuration[0]);
        return configs;
    }

    @Override
    protected void renderContent(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
            IOException {
        String pathInfo = req.getPathInfo();
        if (isMainPageRequest(pathInfo)) {
            loadMainPage(resp, req.getAttribute("felix.webconsole.pluginRoot").toString());
            System.out.println("configadmin service references: " + cfgAdminTracker.getServiceReferences().length);
            System.out.println("configadmin services: " + cfgAdminTracker.getServices().length);
        } else {
            resp.setHeader("Content-Type", "application/json");
            if (pathInfo.endsWith("/configadmin.json")) {
                listConfigAdminServices(resp);
            } else if (pathInfo.endsWith("/configurations.json")) {
                String configAdminPid = req.getParameter("configAdmin");
                listConfigurationsByConfigAdmin(resp, configAdminPid);
            }
        }
    }

    private String resolveVariables(String rval, final Map<String, String> templateVars) {
        for (String var : templateVars.keySet()) {
            String value = templateVars.get(var);
            rval = rval.replaceAll("\\$\\{" + var + "\\}", value);
        }
        return rval;
    }

}
