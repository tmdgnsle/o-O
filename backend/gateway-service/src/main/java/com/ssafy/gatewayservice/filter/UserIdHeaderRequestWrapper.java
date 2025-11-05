package com.ssafy.gatewayservice.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserIdHeaderRequestWrapper extends HttpServletRequestWrapper {

    private final Map<String, String> customHeaders;

    public UserIdHeaderRequestWrapper(HttpServletRequest request, String userId) {
        super(request);
        this.customHeaders = new HashMap<>();
        this.customHeaders.put("X-USER-ID", userId);
    }

    @Override
    public String getHeader(String name) {
        String headerValue = customHeaders.get(name);
        if (headerValue != null) {
            return headerValue;
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        names.addAll(customHeaders.keySet());
        return Collections.enumeration(names);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        List<String> values = new ArrayList<>();

        String customValue = customHeaders.get(name);
        if (customValue != null) {
            values.add(customValue);
        }

        Enumeration<String> originalValues = super.getHeaders(name);
        if (originalValues != null) {
            values.addAll(Collections.list(originalValues));
        }

        return Collections.enumeration(values);
    }
}
