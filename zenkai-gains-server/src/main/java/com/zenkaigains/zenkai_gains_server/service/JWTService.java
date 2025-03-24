package com.zenkaigains.zenkai_gains_server.service;

import com.zenkaigains.zenkai_gains_server.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JWTService {

    private final Key key;

    // Read the 'jwt.secret' from application.properties.
    public JWTService(@Value("${jwt.secret}") String secretString) {
        byte[] keyBytes = secretString.getBytes();
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        long expirationMillis = 24 * 60 * 60 * 1000; // 1 day
        Date expiry = new Date(now + expirationMillis);

        // Extract the user's roles as strings (e.g. "ROLE_ADMIN", "ROLE_USER")
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(user.getEmail())  // or user.getUsername()
                .claim("roles", roles)        // Add a custom claim for roles
                .setIssuedAt(new Date(now))
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            // Optionally log the exception
            return false;
        }
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public List<String> extractRoles(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("roles", List.class);
    }
}
