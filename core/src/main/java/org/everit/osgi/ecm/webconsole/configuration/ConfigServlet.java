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
import java.nio.charset.Charset;
import java.nio.charset.IllegalCharsetNameException;
import java.nio.charset.UnsupportedCharsetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONWriter;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.cm.ManagedService;
import org.osgi.service.metatype.ObjectClassDefinition;

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

    private final BundleContext bundleCtx;

    private final ConfigManager configManager;

    public ConfigServlet(final BundleContext bundleCtx,
            final ConfigManager configManager) {
        this.bundleCtx = Objects.requireNonNull(bundleCtx, "bundleCtx cannot be null");
        this.configManager = Objects.requireNonNull(configManager, "configManager cannot be null");
    }

    private Charset charsetByRequest(final HttpServletRequest req) {
        try {
            return Charset.forName(req.getCharacterEncoding());
        } catch (IllegalCharsetNameException | UnsupportedCharsetException e) {
            return Charset.defaultCharset();
        }
    }

    private Consumer<ServiceReference<ManagedService>> createManagedServiceJSONSerializer(
            final JSONWriter writer) {
        return (serviceRef) -> {
            writer.object();
            writer.key("bundleSymName");
            writer.value(serviceRef.getBundle().getSymbolicName());
            writer.key("bundleName");
            writer.value(serviceRef.getBundle().getHeaders().get("Bundle-Name"));
            writer.key("location");
            writer.value(serviceRef.getBundle().getLocation());
            ObjectClassDefinition objClassDef = configManager.getObjectClassDefinition(serviceRef);
            writer.key("name");
            writer.value(objClassDef.getName());
            writer.key("description");
            writer.value(objClassDef.getDescription());
            writer.key("pid");
            writer.value(serviceRef.getProperty("service.pid"));
            writer.endObject();
            System.out.println("managedservice prop keys: " + Arrays.asList(serviceRef.getPropertyKeys()));
            for (String key : serviceRef.getPropertyKeys()) {
                System.out.println("\t\t" + key + ": " + serviceRef.getProperty(key));
            }
        };
    }

    @Override
    protected void doDelete(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
    IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo.endsWith("/configuration.json")) {
            String servicePid = req.getParameter("pid");
            String configAdminPid = req.getParameter("configAdminPid");
            String location = req.getParameter("location");
            configManager.deleteConfiguration(servicePid, location, configAdminPid);
            printSuccess(resp);
        }
    }

    @Override
    protected void doPut(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
    IOException {
        String requestBody = requestBody(req);
        System.out.println("received " + req.getCharacterEncoding() + ": '" + requestBody + "'");
        String pid = req.getParameter("pid");
        String factoryPid = req.getParameter("factoryPid");
        String configAdminPid = req.getParameter("configAdminPid");
        configManager.updateConfiguration(configAdminPid, pid, factoryPid,
                extractRawAttributesFromJSON(new JSONObject(requestBody)));
        resp.setContentType("application/json");
        printSuccess(resp);
    }

    private Map<String, List<String>> extractRawAttributesFromJSON(final JSONObject json) {
        Map<String, List<String>> rawAttributes = new HashMap<>();
        for (Object rawKey : json.keySet()) {
            String key = (String) rawKey;
            JSONArray value = (JSONArray) json.get(key);
            int stringCount = value.length();
            List<String> values = new ArrayList<String>(stringCount);
            for (int i = 0; i < stringCount; ++i) {
                values.add(value.getString(i));
            }
            rawAttributes.put(key, values);
            // System.out.println(rawKey + ": " + rawKey.getClass() + "\tvalue: " + value + ": " + value.getClass());
        }
        return rawAttributes;
    }

    @Override
    public String getCategory() {
        return "Everit";
    }

    private void getConfigForm(final HttpServletResponse resp,
            final String pid,
            final String factoryPid,
            final String location,
            final String configAdminPid) {
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            writer.array();
            configManager.getConfigForm(pid, Optional.ofNullable(factoryPid), location, configAdminPid).forEach(
                    (attr) -> attr.toJSON(writer));
            writer.endArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
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
            configManager.configAdminStream().forEach((confAdmin) -> {
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

    private void listManagedServices(final HttpServletResponse resp) {
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            writer.array();
            configManager.lookupConfigurations().forEach((configurable) -> configurable.toJSON(writer));
            // configManager.listManagedServices().forEach(
            // (serviceRef) -> createManagedServiceJSONSerializer(writer).accept(serviceRef));
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

    private void printSuccess(final HttpServletResponse resp) {
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            writer.object();
            writer.key("status");
            writer.value("success");
            writer.endObject();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void renderContent(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
    IOException {
        String pathInfo = req.getPathInfo();
        if (isMainPageRequest(pathInfo)) {
            loadMainPage(resp, req.getAttribute("felix.webconsole.pluginRoot").toString());
        } else {
            resp.setHeader("Content-Type", "application/json");
            if (pathInfo.endsWith("/configadmin.json")) {
                listConfigAdminServices(resp);
            } else if (pathInfo.endsWith("/managedservices.json")) {
                listManagedServices(resp);
            } else if (pathInfo.endsWith("/configuration.json")) {
                String pid = req.getParameter("pid");
                String factoryPid = req.getParameter("factoryPid");
                String location = req.getParameter("location");
                String configAdminPid = req.getParameter("configAdminPid");
                getConfigForm(resp, pid, factoryPid, location, configAdminPid);
            }
        }
    }

    private String requestBody(final HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder(req.getContentLength());
        List<String> lines = IOUtils.readLines(req.getInputStream(), charsetByRequest(req));
        for (String line : lines) {
            sb.append(line);
        }
        return sb.toString();
    }

    private String resolveVariables(String rval, final Map<String, String> templateVars) {
        for (String var : templateVars.keySet()) {
            String value = templateVars.get(var);
            rval = rval.replaceAll("\\$\\{" + var + "\\}", value);
        }
        return rval;
    }

}
