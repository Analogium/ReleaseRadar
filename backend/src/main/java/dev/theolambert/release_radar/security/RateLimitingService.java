package dev.theolambert.release_radar.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Rate limiting anti-brute-force : un {@link Bucket} (token bucket) par clé
 * (typiquement l'IP client). Les buckets sont conservés en mémoire — suffisant
 * pour un déploiement mono-instance — et évincés par Caffeine après une période
 * d'inactivité, pour éviter que la table ne grossisse indéfiniment.
 */
@Service
public class RateLimitingService {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(15))
            .maximumSize(100_000)
            .build();

    private final int capacity;
    private final Duration refillPeriod;

    public RateLimitingService(
            @Value("${ratelimit.auth.capacity:10}") int capacity,
            @Value("${ratelimit.auth.refill-minutes:1}") long refillMinutes) {
        this.capacity = capacity;
        this.refillPeriod = Duration.ofMinutes(refillMinutes);
    }

    /**
     * Tente de consommer un jeton pour la clé donnée.
     *
     * @return la sonde Bucket4j : {@code isConsumed()} indique si la requête passe,
     *         et {@code getNanosToWaitForRefill()} le délai avant le prochain jeton.
     */
    public ConsumptionProbe tryConsume(String key) {
        return buckets.get(key, k -> newBucket()).tryConsumeAndReturnRemaining(1);
    }

    private Bucket newBucket() {
        // `capacity` requêtes autorisées, rechargées entièrement toutes les `refillPeriod`.
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, refillPeriod)
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}
