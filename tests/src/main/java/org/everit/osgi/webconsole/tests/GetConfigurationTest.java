/**
 * This file is part of Everit - Felix Webconsole Configuration Integration Tests.
 *
 * Everit - Felix Webconsole Configuration Integration Tests is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole Configuration Integration Tests is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole Configuration Integration Tests.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.everit.osgi.webconsole.tests;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import org.everit.osgi.webconsole.configuration.DisplayedAttribute;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.osgi.service.metatype.AttributeDefinition;

@Component(immediate = true)
@Service(GetConfigurationTest.class)
@Properties({
    @Property(name = "eosgi.testEngine", value = "junit4"),
    @Property(name = "eosgi.testId", value = "getConfigurationTest"),
})
public class GetConfigurationTest {

    private static final Map<String, Integer> typeNameToCode = new HashMap<>();

    static {
        typeNameToCode.put("boolean", AttributeDefinition.BOOLEAN);
        typeNameToCode.put("byte", AttributeDefinition.BYTE);
        typeNameToCode.put("character", AttributeDefinition.CHARACTER);
        typeNameToCode.put("double", AttributeDefinition.DOUBLE);
        typeNameToCode.put("float", AttributeDefinition.FLOAT);
        typeNameToCode.put("integer", AttributeDefinition.INTEGER);
        typeNameToCode.put("long", AttributeDefinition.LONG);
        typeNameToCode.put("password", AttributeDefinition.PASSWORD);
        typeNameToCode.put("short", AttributeDefinition.SHORT);
        typeNameToCode.put("string", AttributeDefinition.STRING);
    }

    private HttpClient client;

    public void assertContainsAll(final List<DisplayedAttribute> actual, final List<DisplayedAttribute> expected) {
        for (DisplayedAttribute exp : expected) {
            if (!actual.contains(exp)) {
                String exception = actual.stream().filter((act) -> act.getId().equals(exp.getId()))
                        .findFirst()
                        .map((act) -> act + "\nis not equal to\n" + exp)
                        .orElseGet(() -> "failed to assert that " + actual + " contains " + exp);
                throw new AssertionError(exception);
            }
        }
    }

    private DisplayedAttribute buildAttributeFromJSON(final JSONObject jsonAttr) {
        DisplayedAttribute rval = new DisplayedAttribute();
        rval.setId(jsonAttr.getString("id"));
        rval.setName(jsonAttr.getString("name"));
        rval.setDescription(jsonAttr.getString("description"));
        JSONObject jsonType = jsonAttr.getJSONObject("type");
        if ("unbound".equals(jsonType.get("maxOccurences"))) {
            rval.setMaxOccurences(Integer.MAX_VALUE);
        } else {
            rval.setMaxOccurences(jsonType.getInt("maxOccurences"));
        }
        Object jsonBaseType = jsonType.get("baseType");
        if (jsonBaseType.equals("service")) {
            rval.setToService();
        } else {
            rval.setType(typeNameToCode.get(jsonBaseType));
        }
        if (jsonType.has("options")) {
            JSONObject jsonOptions = jsonType.getJSONObject("options");
            for (Object rawOptValue : jsonOptions.keySet()) {
                String optLabel = (String) rawOptValue;
                String optValue = jsonOptions.getString(optLabel);
                rval.addOption(optLabel, optValue);
            }
        }
        JSONArray jsonValue = jsonAttr.getJSONArray("value");
        String[] values = new String[jsonValue.length()];
        for (int i = 0; i < jsonValue.length(); ++i) {
            values[i] = jsonValue.get(i).toString();
        }
        rval.setValue(values);
        return rval;
    }

    private List<DisplayedAttribute> buildAttributeListFromJSON(final JSONArray rawArray) {
        List<DisplayedAttribute> rval = new ArrayList<DisplayedAttribute>(rawArray.length());
        for (int i = 0; i < rawArray.length(); ++i) {
            rval.add(buildAttributeFromJSON(rawArray.getJSONObject(i)));
        }
        return rval;
    }

    private List<DisplayedAttribute> createExpectedAttributes() {
        List<DisplayedAttribute> rval = new ArrayList<DisplayedAttribute>();
        rval.add(new DisplayedAttribute()
        .setId("stringProp")
        .setName("string property")
        .setDescription("description of string property")
        .setType(AttributeDefinition.STRING)
        .setValue(new String[] { "default value" }));
        rval.add(new DisplayedAttribute()
        .setId("enumeration")
        .setName("enumeration")
        .setDescription("Description for enumeration")
        .addOption("name1", "value1")
        .addOption("name2", "value2")
        .addOption("name3", "value3")
        .setType(AttributeDefinition.STRING)
        .setValue(new String[] { "value3" }));
        rval.add(new DisplayedAttribute()
        .setDescription("Description for someStrings")
        .setId("someStrings")
        .setName("some strings")
        .setMaxOccurences(Integer.MAX_VALUE)
        .setType(AttributeDefinition.STRING)
        .setValue(new String[] { "asd", "bsd" }));
        rval.add(new DisplayedAttribute()
        .setDescription("this is a dummy service")
        .setId("dummyService.target")
        .setToService()
        .setName("Property dummyService.target")
        .setMaxOccurences(0)
        .setValue(new String[] {}));
        return rval;
    }

    @Before
    public void setUp() {
        BasicCredentialsProvider credProv = new BasicCredentialsProvider();
        credProv.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials("admin", "admin"));
        client = HttpClientBuilder.create().setDefaultCredentialsProvider(credProv).build();
    }

    @Test
    @TestDuringDevelopment
    public void testGetAttributes() {
        HttpGet request = new HttpGet(
                "http://localhost:8080/system/console/configuration/configuration.json?configAdminPid=org.apache.felix.cm.ConfigurationAdmin&pid=org.everit.osgi.webconsole.tests");
        try {
            HttpResponse resp = client.execute(request);
            Assert.assertEquals(200, resp.getStatusLine().getStatusCode());
            JSONArray rawArray = new JSONArray(new JSONTokener(resp.getEntity().getContent()));
            List<DisplayedAttribute> actual = buildAttributeListFromJSON(rawArray);
            List<DisplayedAttribute> expected = createExpectedAttributes();
            assertContainsAll(actual, expected);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
