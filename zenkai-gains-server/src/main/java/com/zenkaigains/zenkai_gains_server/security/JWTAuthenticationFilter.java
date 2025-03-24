package com.zenkaigains.zenkai_gains_server.security;

import com.zenkaigains.zenkai_gains_server.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTAuthenticationFilter.class);

    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        logger.debug("Processing request for URI: {}", requestURI);

        String token = extractTokenFromCookies(request);
        if (!StringUtils.hasText(token)) {
            logger.debug("No JWT token found in cookies.");
        } else {
            logger.debug("JWT token found (masked): {}", maskToken(token));
        }

        if (StringUtils.hasText(token) && jwtService.validateToken(token)) {
            String username = jwtService.extractUsername(token);
            logger.debug("Token valid, extracted username: {}", username);
            // Extract roles using our helper method in JWTService
            List<String> roleStrings = jwtService.extractRoles(token);
            List<SimpleGrantedAuthority> authorities = roleStrings.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            logger.debug("Token is invalid or missing.");
        }
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String maskToken(String token) {
        if (token.length() <= 10) {
            return token;
        }
        return token.substring(0, 5) + "****" + token.substring(token.length() - 5);
    }

}
