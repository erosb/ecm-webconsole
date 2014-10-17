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
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.util.tracker.ServiceTracker;

public class ConfigServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = 1957046444200622859L;

    public static final String CONFIG_LABEL = "ecm-config";

    private final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker;

    public ConfigServlet(final ServiceTracker<ConfigurationAdmin, ConfigurationAdmin> cfgAdminTracker) {
        this.cfgAdminTracker = cfgAdminTracker;
    }

    @Override
    public String getCategory() {
        return "Everit";
    }

    @Override
    public String getLabel() {
        return CONFIG_LABEL;
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

    private String loadTemplate(final String path, final Map<String, String> templateVars) {
        try (InputStream inputStream = getResourceProvider().getClass().getResourceAsStream(path)) {
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

    @Override
    protected void renderContent(final HttpServletRequest req, final HttpServletResponse resp) throws ServletException,
            IOException {
        String pathInfo = req.getPathInfo();
        if (isMainPageRequest(pathInfo)) {
            Map<String, String> templateVars = new HashMap<String, String>(1);
            templateVars.put("rootPath", req.getAttribute("felix.webconsole.pluginRoot").toString());
            resp.getWriter().println(loadTemplate("/everit/webconsole/threadviewer/template.html", templateVars));
        }
        cfgAdminTracker.getServiceReferences()[0].getProperty("service.description");
    }

    private String resolveVariables(String rval, final Map<String, String> templateVars) {
        for (String var : templateVars.keySet()) {
            String value = templateVars.get(var);
            rval = rval.replaceAll("\\$\\{" + var + "\\}", value);
        }
        return rval;
    }

}
