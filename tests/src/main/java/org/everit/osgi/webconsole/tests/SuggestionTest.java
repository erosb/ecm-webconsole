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
package org.everit.osgi.webconsole.tests;

import java.io.IOException;
import java.net.URLEncoder;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Properties;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClientBuilder;
import org.everit.osgi.dev.testrunner.TestDuringDevelopment;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

@Component(immediate = true)
@Service(SuggestionTest.class)
@Properties({
    @Property(name = "eosgi.testEngine", value = "junit4"),
    @Property(name = "eosgi.testId", value = "SuggestionTest"),
})
public class SuggestionTest {

    private HttpClient client;

    @Test
    @TestDuringDevelopment
    public void firstTest() {
        JSONArray rawArray = readArray("http://localhost:8080/system/console/configuration/suggestion.json"
                + "?configAdminPid=org.apache.felix.cm.ConfigurationAdmin"
                + "&pid=org.everit.osgi.webconsole.tests"
                + "&attributeId=eventAdmin.target");
        Assert.assertEquals(1, rawArray.length());
        Assert.assertEquals(rawArray.getJSONObject(0).getString("serviceClass"),
                "org.apache.felix.eventadmin.impl.security.EventAdminSecurityDecorator");
    }

    private JSONArray readArray(final String requestURI) {
        return readArray(requestURI, 200);
    }

    private JSONArray readArray(final String requestURI, final int expectedStatusCode) {
        HttpGet request = new HttpGet(requestURI);
        try {
            HttpResponse resp = client.execute(request);
            Assert.assertEquals(expectedStatusCode, resp.getStatusLine().getStatusCode());
            JSONArray rawArray = new JSONArray(new JSONTokener(resp.getEntity().getContent()));
            System.out.println(rawArray);
            return rawArray;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private JSONObject readObject(final String requestURI, final int expectedStatusCode) {
        HttpGet request = new HttpGet(requestURI);
        try {
            HttpResponse resp = client.execute(request);
            Assert.assertEquals(expectedStatusCode, resp.getStatusLine().getStatusCode());
            JSONObject rawObject = new JSONObject(new JSONTokener(resp.getEntity().getContent()));
            System.out.println(rawObject);
            return rawObject;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Before
    public void setUp() {
        BasicCredentialsProvider credProv = new BasicCredentialsProvider();
        credProv.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials("admin", "admin"));
        client = HttpClientBuilder.create().setDefaultCredentialsProvider(credProv).build();
    }

    @Test
    @TestDuringDevelopment
    public void testInvalidFilterQuery() {
        JSONObject obj = readObject("http://localhost:8080/system/console/configuration/suggestion.json"
                + "?configAdminPid=org.apache.felix.cm.ConfigurationAdmin"
                + "&pid=org.everit.osgi.webconsole.tests"
                + "&attributeId=dummyService.target"
                + "&query=whatever", 200);
        Assert.assertEquals("invalid query: Missing opening parenthesis: whatever", obj.getString("error"));
    }

    @Test
    @TestDuringDevelopment
    public void testSuggestionsForDummyService() {
        JSONArray array = readArray("http://localhost:8080/system/console/configuration/suggestion.json"
                + "?configAdminPid=org.apache.felix.cm.ConfigurationAdmin"
                + "&pid=org.everit.osgi.webconsole.tests"
                + "&attributeId=dummyService.target");
        Assert.assertEquals("15 dummyService suggestions are returned", 15, array.length());
    }

    @Test
    @TestDuringDevelopment
    @SuppressWarnings("deprecation")
    public void testValidFilterQuery() {
        JSONArray array = readArray("http://localhost:8080/system/console/configuration/suggestion.json"
                + "?configAdminPid=org.apache.felix.cm.ConfigurationAdmin"
                + "&pid=org.everit.osgi.webconsole.tests"
                + "&attributeId=dummyService.target"
                + "&query=" + URLEncoder.encode("(counter=12)"));
        Assert.assertEquals(1, array.length());
    }
}
