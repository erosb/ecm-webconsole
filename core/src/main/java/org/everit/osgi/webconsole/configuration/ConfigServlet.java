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
package org.everit.osgi.webconsole.configuration;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONWriter;
import org.osgi.framework.InvalidSyntaxException;

public class ConfigServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = 1957046444200622859L;

    public static final String CONFIG_LABEL = "configuration";

    private static final Set<String> loadableJavascriptFiles = new HashSet<String>(Arrays.asList(
            "lib/backbone.js",
            "lib/backbone.keys.js",
            "lib/handlebars-v2.0.0.js",
            "lib/require.js",
            "lib/underscore-min.js",
            "lib/text.js",
            // app models
            "app/models/ApplicationModel.js",
            "app/models/AttributeList.js",
            "app/models/AttributeModel.js",
            "app/models/ConfigAdminModel.js",
            "app/models/ConfigAdminList.js",
            "app/models/ManagedServiceList.js",
            "app/models/ManagedServiceModel.js",
            "app/models/ServiceSuggestionModel.js",
            "app/models/ServiceAttributeModel.js",
            "app/app.js",
            // app/views
            "app/views/AttributeListView.js",
            "app/views/attributeviews.js",
            "app/views/CheckboxListView.js",
            "app/views/ConfigAdminListView.js",
            "app/views/ConfigurationDeletionView.js",
            "app/views/ManagedServiceFactoryRowView.js",
            "app/views/ManagedServiceListView.js",
            "app/views/ManagedServiceRowView.js",
            "app/views/MultiplePrimitiveAttributeView.js",
            "app/views/NullWrapperView.js",
            "app/views/ServiceAttributeView.js",
            "app/views/ServiceFilterView.js",
            "app/views/ServiceSelectorView.js",
            "app/views/SingularCheckboxAttributeView.js",
            "app/views/SingularPrimitiveAttributeView.js",
            "app/views/SingularSelectAttributeView.js",
            "app/views/viewfactory.js",
            "app/views/templates.html"
            ));

    private final ConfigManager configManager;

    public ConfigServlet(final ConfigManager configManager) {
        this.configManager = Objects.requireNonNull(configManager, "configManager cannot be null");
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
        String pid = req.getParameter("pid");
        String factoryPid = req.getParameter("factoryPid");
        String configAdminPid = req.getParameter("configAdminPid");
        String location = req.getParameter("location");
        Map<String, List<String>> attributes = extractRawAttributesFromJSON(new JSONObject(requestBody));
        if (pid == null) {
            resp.setContentType("application/json");
            JSONWriter writer = new JSONWriter(resp.getWriter());
            configManager.createConfiguration(configAdminPid, factoryPid, location, attributes)
            .toJSON(writer);

        } else {
            configManager.updateConfiguration(configAdminPid, pid, factoryPid, attributes);
            printSuccess(resp);
        }
    }

    private Map<String, List<String>> extractRawAttributesFromJSON(final JSONObject json) {
        Map<String, List<String>> rawAttributes = new HashMap<>();
        for (Object rawKey : json.keySet()) {
            String key = (String) rawKey;
            JSONArray valueArr = (JSONArray) json.get(key);
            int stringCount = valueArr.length();
            List<String> values = new ArrayList<String>(stringCount);
            for (int i = 0; i < stringCount; ++i) {
                Object value = valueArr.get(i);
                if (value.equals(JSONObject.NULL)) {
                    values.add(null);
                } else {
                    values.add(value.toString());
                }
            }
            rawAttributes.put(key, values);
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
            configManager.getConfigForm(pid, factoryPid, location, configAdminPid).forEach(
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
                return ConfigServlet.class.getResource("/everit/webconsole/configuration/js/" + jsFile);
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
        return Optional.ofNullable(request.getHeader("Accept"))
                .map((header) -> header.indexOf("application/json") == -1).orElse(false);
    }

    private boolean isMainPageRequest(final String pathInfo) {
        return pathInfo.indexOf("/" + CONFIG_LABEL) > -1
                && !(pathInfo.endsWith("css") || pathInfo.endsWith("js") || pathInfo.endsWith("map") || pathInfo
                        .endsWith("json"));
    }

    private String listConfigAdminServices() {
        StringWriter strWriter = new StringWriter();
        listConfigAdminServices(strWriter);
        return strWriter.toString();
    }

    private void listConfigAdminServices(final Writer writer) {
        JSONWriter jsonWriter = new JSONWriter(writer);
        jsonWriter.array();
        configManager.configAdminStream().forEach((confAdmin) -> {
            jsonWriter.object();
            jsonWriter.key("pid");
            jsonWriter.value(confAdmin.getProperty("service.pid"));
            jsonWriter.key("description");
            jsonWriter.value(confAdmin.getProperty("service.description"));
            jsonWriter.key("bundleId");
            jsonWriter.value(confAdmin.getBundle().getBundleId());
            jsonWriter.endObject();
        });
        jsonWriter.endArray();
    }

    private void listManagedServices(final String configAdminPid, final HttpServletResponse resp) {
        try {
            listManagedServices(configAdminPid, resp.getWriter());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void listManagedServices(final String configAdminPid, final Writer writer) {
        JSONWriter jsonWriter = new JSONWriter(writer);
        jsonWriter.array();
        configManager.lookupConfigurations(configAdminPid).forEach((configurable) -> configurable.toJSON(jsonWriter));
        jsonWriter.endArray();
    }

    private void loadMainPage(String pathInfo, final HttpServletResponse resp, final String pluginRoot)
            throws IOException {
        String pathPrefix = "/" + CONFIG_LABEL;
        if (pathInfo.indexOf(pathPrefix) != 0) {
            throw new IllegalArgumentException("invalid path info " + pathInfo);
        }
        if (pathInfo.charAt(0) == '/') {
            pathInfo = pathInfo.substring(1);
        }
        String[] segments = pathInfo.split("/");
        Map<String, String> templateVars = new HashMap<String, String>(1);
        if (segments.length > 1) {
            String configAdminPid = segments[1];
            StringWriter writer = new StringWriter();
            listManagedServices(configAdminPid, writer);
            String managedServices = "{\"" + configAdminPid + "\": " + writer.toString() + "}";
            templateVars.put("managedServices", managedServices);
        } else {
            templateVars.put("managedServices", "null");
        }
        templateVars.put("rootPath", pluginRoot);
        templateVars.put("configAdmins", listConfigAdminServices());
        resp.getWriter().println(loadTemplate("/everit/webconsole/configuration/main.html", templateVars));
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

    private void printServiceSuggestions(final HttpServletResponse resp, final String configAdminPid, final String pid,
            final String attributeId, final String ldapQuery) {
        try {
            JSONWriter writer = new JSONWriter(resp.getWriter());
            List<ServiceSuggestion> suggestions;
            try {
                suggestions = configManager.getServiceSuggestions(configAdminPid, pid, attributeId,
                        ldapQuery);
                writer.array();
                for (ServiceSuggestion suggestion : suggestions) {
                    suggestion.toJSON(writer);
                }
                writer.endArray();
            } catch (InvalidSyntaxException e) {
                // resp.setStatus(403);
                writer.object();
                writer.key("error");
                writer.value("invalid query: " + e.getMessage());
                writer.endObject();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void printSuccess(final HttpServletResponse resp) {
        resp.setContentType("application/json");
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
            loadMainPage(pathInfo, resp, req.getAttribute("felix.webconsole.pluginRoot").toString());
        } else {
            resp.setContentType("application/json");
            if (pathInfo.endsWith("/configadmin.json")) {
                listConfigAdminServices(resp.getWriter());
            } else if (pathInfo.endsWith("/managedservices.json")) {
                String configAdminPid = req.getParameter("configAdminPid");
                listManagedServices(configAdminPid, resp);
            } else if (pathInfo.endsWith("/configuration.json")) {
                String pid = req.getParameter("pid");
                String factoryPid = req.getParameter("factoryPid");
                String location = req.getParameter("location");
                String configAdminPid = req.getParameter("configAdminPid");
                getConfigForm(resp, pid, factoryPid, location, configAdminPid);
            } else if (pathInfo.endsWith("/suggestion.json")) {
                String configAdminPid = req.getParameter("configAdminPid");
                String pid = req.getParameter("pid");
                String attributeId = req.getParameter("attributeId");
                String ldapQuery = req.getParameter("query");
                printServiceSuggestions(resp, configAdminPid, pid, attributeId, ldapQuery);
            }
        }
    }

    private String requestBody(final HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder(req.getContentLength());
        String line;
        BufferedReader reader = req.getReader();
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
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
