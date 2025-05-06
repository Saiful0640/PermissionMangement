package com.permissionmanagement.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private static final String SECRET_KEY = "your-very-secure-and-long-secret-key-for-jwt-signing-1234567890abcdef";
    private final Key jwtSecret;

    public JwtRequestFilter() {
        this.jwtSecret = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logger.info("Skipping JWT filter for OPTIONS request");
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String role = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            logger.info("Received JWT token: {}", jwt);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret)
                        .setAllowedClockSkewSeconds(300) // Allow 5 minutes of clock skew
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();
                username = claims.getSubject();
                role = claims.get("role", String.class);
                logger.info("Extracted username: {}, role: {}", username, role);
            } catch (ExpiredJwtException e) {
                logger.error("JWT token expired: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"JWT token expired\"}");
                return;
            } catch (SignatureException e) {
                logger.error("Invalid JWT signature: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Invalid JWT signature\"}");
                return;
            } catch (Exception e) {
                logger.error("JWT parsing error: {}", e.getMessage(), e);
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Invalid JWT token\"}");
                return;
            }
        } else {
            logger.info("No Authorization header or invalid format for request to {}: Authorization header: {}",
                    request.getRequestURI(), authorizationHeader);
        }

        if (username != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.info("Set authentication for user: {}, authorities: {}", username, authorities);
        } else if (authorizationHeader != null && !request.getRequestURI().equals("/api/auth/login")) {
            logger.warn("Failed to authenticate user for request to {}. Username or role could not be extracted from JWT.",
                    request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Authentication failed: Invalid or missing JWT token\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
/*
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private static final String SECRET_KEY = "your-very-secure-and-long-secret-key-for-jwt-signing-1234567890abcdef"; // Same key as AuthService

    private final UserDetailsService userDetailsService;
    private final Key jwtSecret;

    @Autowired
    public JwtRequestFilter(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.jwtSecret = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logger.info("Skipping JWT filter for OPTIONS request");
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            logger.info("Received JWT token: {}", jwt);
            try {
                username = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody()
                        .getSubject();
                logger.info("Extracted username from JWT: {}", username);
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                logger.error("JWT token expired: {}", e.getMessage());
            } catch (io.jsonwebtoken.SignatureException e) {
                logger.error("Invalid JWT signature: {}", e.getMessage());
            } catch (Exception e) {
                logger.error("JWT parsing error: {}", e.getMessage(), e);
            }
        } else {
            logger.info("No Authorization header or invalid format for request to {}: Authorization header: {}",
                    request.getRequestURI(), authorizationHeader);
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            logger.info("Loaded user details for username: {}, authorities: {}", username, userDetails.getAuthorities());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.info("Set authentication for user: {}", username);
        } else if (username == null && authorizationHeader != null) {
            logger.warn("Failed to authenticate user for request to {}. Username could not be extracted from JWT.",
                    request.getRequestURI());
        }

        chain.doFilter(request, response);
    }
}
*/
