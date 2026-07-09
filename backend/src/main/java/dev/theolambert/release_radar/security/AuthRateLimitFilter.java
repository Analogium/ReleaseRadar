package dev.theolambert.release_radar.security;

import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Limite le débit des endpoints d'authentification ({@code /api/auth/**}) par IP
 * pour freiner le bourrinage de mots de passe et le spam d'inscriptions.
 *
 * <p>L'IP client est lue via {@code getRemoteAddr()} : en production, le filtre
 * {@code ForwardedHeaderFilter} (activé par {@code server.forward-headers-strategy=framework})
 * a déjà résolu le vrai client depuis l'en-tête {@code X-Forwarded-For} transmis par
 * Caddy puis nginx.
 */
@Component
@RequiredArgsConstructor
public class AuthRateLimitFilter extends OncePerRequestFilter {

    // Corps JSON constant (aucune donnée utilisateur → écrit en dur, pas besoin de Jackson).
    private static final String TOO_MANY_REQUESTS_BODY =
            "{\"error\":\"Too many requests. Please try again later.\"}";

    private final RateLimitingService rateLimiting;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        ConsumptionProbe probe = rateLimiting.tryConsume(request.getRemoteAddr());

        if (probe.isConsumed()) {
            filterChain.doFilter(request, response);
            return;
        }

        long retryAfterSeconds = Math.max(1, Duration.ofNanos(probe.getNanosToWaitForRefill()).toSeconds());
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(TOO_MANY_REQUESTS_BODY);
    }
}
